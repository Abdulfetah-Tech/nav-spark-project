import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Briefcase, DollarSign, Star, Clock } from "lucide-react";

interface Booking {
  id: string;
  service_type: string;
  scheduled_date: string;
  status: string;
  total_price: number;
  notes: string;
  customer_id: string;
  profiles?: { full_name: string };
}

interface Quotation {
  id: string;
  quoted_price: number;
  description: string;
  estimated_duration: string;
  status: string;
  created_at: string;
  bookings?: {
    service_type: string;
    scheduled_date: string;
    profiles?: { full_name: string };
  };
}

export default function ProviderDashboard() {
  const [loading, setLoading] = useState(true);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    quoted_price: "",
    description: "",
    estimated_duration: "",
    valid_until: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkProviderAndFetchData();
  }, []);

  const checkProviderAndFetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: provider } = await supabase
        .from("service_providers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!provider) {
        toast({
          title: "Not a provider",
          description: "You need to register as a service provider first.",
          variant: "destructive"
        });
        navigate("/dashboard");
        return;
      }

      setProviderId(provider.id);
      await fetchBookings(provider.id);
      await fetchQuotations(provider.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (providerId: string) => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const bookingsWithProfiles = await Promise.all(
        data.map(async (booking) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", booking.customer_id)
            .single();
          return { ...booking, profiles: profile };
        })
      );
      setBookings(bookingsWithProfiles);
    }
  };

  const fetchQuotations = async (providerId: string) => {
    const { data, error } = await supabase
      .from("quotations")
      .select("*, bookings:booking_id (service_type, scheduled_date, customer_id)")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const quotationsWithProfiles = await Promise.all(
        data.map(async (quote) => {
          let profileData = null;
          if (quote.bookings?.customer_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", quote.bookings.customer_id)
              .single();
            profileData = profile;
          }
          return {
            ...quote,
            bookings: quote.bookings ? { ...quote.bookings, profiles: profileData } : undefined
          };
        })
      );
      setQuotations(quotationsWithProfiles);
    }
  };

  const handleSubmitQuote = async () => {
    if (!selectedBooking || !providerId) return;

    const { error } = await supabase.from("quotations").insert({
      booking_id: selectedBooking.id,
      provider_id: providerId,
      customer_id: selectedBooking.customer_id,
      quoted_price: parseFloat(quoteForm.quoted_price),
      description: quoteForm.description,
      estimated_duration: quoteForm.estimated_duration,
      valid_until: quoteForm.valid_until ? new Date(quoteForm.valid_until).toISOString() : null
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Quote sent!",
        description: "Your quote has been sent to the customer."
      });
      setQuoteDialogOpen(false);
      setQuoteForm({ quoted_price: "", description: "", estimated_duration: "", valid_until: "" });
      fetchQuotations(providerId);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Status updated",
        description: `Booking status changed to ${status}`
      });
      if (providerId) fetchBookings(providerId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Provider Dashboard</h1>
            <p className="text-muted-foreground">Manage your bookings and quotes</p>
          </div>
          <div className="flex gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'confirmed').length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending Quotes</p>
                  <p className="text-2xl font-bold">{quotations.filter(q => q.status === 'pending').length}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">Job Requests</TabsTrigger>
            <TabsTrigger value="quotes">My Quotes</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-4">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No job requests yet</p>
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{booking.service_type}</CardTitle>
                        <CardDescription>
                          Customer: {booking.profiles?.full_name || "Unknown"}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        booking.status === 'confirmed' ? 'default' :
                        booking.status === 'pending' ? 'secondary' : 'outline'
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Scheduled Date</p>
                        <p className="font-medium">{new Date(booking.scheduled_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-medium">${booking.total_price}</p>
                      </div>
                    </div>
                    {booking.notes && (
                      <div>
                        <p className="text-muted-foreground text-sm">Notes</p>
                        <p className="text-sm">{booking.notes}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Dialog open={quoteDialogOpen && selectedBooking?.id === booking.id} onOpenChange={setQuoteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedBooking(booking)}>Send Quote</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Send Quote</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Quoted Price ($)</Label>
                              <Input
                                type="number"
                                value={quoteForm.quoted_price}
                                onChange={(e) => setQuoteForm({ ...quoteForm, quoted_price: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={quoteForm.description}
                                onChange={(e) => setQuoteForm({ ...quoteForm, description: e.target.value })}
                                placeholder="Describe what's included in this quote..."
                              />
                            </div>
                            <div>
                              <Label>Estimated Duration</Label>
                              <Input
                                value={quoteForm.estimated_duration}
                                onChange={(e) => setQuoteForm({ ...quoteForm, estimated_duration: e.target.value })}
                                placeholder="e.g., 2-3 days"
                              />
                            </div>
                            <div>
                              <Label>Valid Until</Label>
                              <Input
                                type="date"
                                value={quoteForm.valid_until}
                                onChange={(e) => setQuoteForm({ ...quoteForm, valid_until: e.target.value })}
                              />
                            </div>
                            <Button onClick={handleSubmitQuote} className="w-full">Submit Quote</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {booking.status === 'pending' && (
                        <>
                          <Button variant="outline" onClick={() => updateBookingStatus(booking.id, 'confirmed')}>
                            Accept
                          </Button>
                          <Button variant="ghost" onClick={() => updateBookingStatus(booking.id, 'cancelled')}>
                            Decline
                          </Button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button variant="outline" onClick={() => updateBookingStatus(booking.id, 'completed')}>
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="quotes" className="space-y-4">
            {quotations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No quotes sent yet</p>
                </CardContent>
              </Card>
            ) : (
              quotations.map((quote) => (
                <Card key={quote.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>${quote.quoted_price}</CardTitle>
                        <CardDescription>
                          {quote.bookings?.service_type} • {quote.bookings?.profiles?.full_name}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        quote.status === 'accepted' ? 'default' :
                        quote.status === 'pending' ? 'secondary' :
                        quote.status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {quote.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{quote.estimated_duration}</span>
                    </div>
                    <p className="text-sm">{quote.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Sent {new Date(quote.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
