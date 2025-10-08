import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Briefcase, Clock, CheckCircle, XCircle } from "lucide-react";

interface Booking {
  id: string;
  service_type: string;
  scheduled_date: string;
  status: string;
  total_price: number;
  notes: string;
  service_providers?: {
    business_name: string;
    rating: number;
  };
}

interface Quotation {
  id: string;
  quoted_price: number;
  description: string;
  estimated_duration: string;
  status: string;
  valid_until: string;
  created_at: string;
  service_providers?: {
    business_name: string;
    rating: number;
  };
  bookings?: {
    service_type: string;
  };
}

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      await fetchBookings(user.id);
      await fetchQuotations(user.id);
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

  const fetchBookings = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, service_providers:provider_id (business_name, rating)")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookings(data as any);
    }
  };

  const fetchQuotations = async (userId: string) => {
    const { data, error } = await supabase
      .from("quotations")
      .select("*, service_providers:provider_id (business_name, rating), bookings:booking_id (service_type)")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setQuotations(data as any);
    }
  };

  const handleQuoteAction = async (quoteId: string, action: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from("quotations")
      .update({ status: action })
      .eq("id", quoteId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: action === 'accepted' ? "Quote accepted!" : "Quote rejected",
        description: action === 'accepted' 
          ? "The provider has been notified. They will contact you soon."
          : "The provider has been notified of your decision."
      });
      const { data: { user } } = await supabase.auth.getUser();
      if (user) fetchQuotations(user.id);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: 'cancelled' })
      .eq("id", bookingId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully."
      });
      const { data: { user } } = await supabase.auth.getUser();
      if (user) fetchBookings(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeBookings = bookings.filter(b => ['pending', 'confirmed'].includes(b.status));
  const completedBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
  const pendingQuotes = quotations.filter(q => q.status === 'pending');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Manage your service requests and bookings</p>
          </div>
          <Button onClick={() => navigate("/#services")}>Find Services</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold">{activeBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending Quotes</p>
                  <p className="text-2xl font-bold">{pendingQuotes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedBookings.filter(b => b.status === 'completed').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Bookings</TabsTrigger>
            <TabsTrigger value="quotes">Quotes ({pendingQuotes.length})</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No active bookings</p>
                  <Button onClick={() => navigate("/#services")}>Browse Services</Button>
                </CardContent>
              </Card>
            ) : (
              activeBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{booking.service_type}</CardTitle>
                        <CardDescription>
                          Provider: {booking.service_providers?.business_name || "Unknown"}
                        </CardDescription>
                      </div>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
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
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-medium">${booking.total_price}</p>
                      </div>
                    </div>
                    {booking.notes && (
                      <div>
                        <p className="text-muted-foreground text-sm">Notes</p>
                        <p className="text-sm">{booking.notes}</p>
                      </div>
                    )}
                    {booking.status === 'pending' && (
                      <Button variant="ghost" onClick={() => cancelBooking(booking.id)}>
                        Cancel Booking
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="quotes" className="space-y-4">
            {pendingQuotes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending quotes</p>
                </CardContent>
              </Card>
            ) : (
              pendingQuotes.map((quote) => (
                <Card key={quote.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>${quote.quoted_price}</CardTitle>
                        <CardDescription>
                          {quote.bookings?.service_type} • {quote.service_providers?.business_name}
                        </CardDescription>
                      </div>
                      <Badge>Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Duration: {quote.estimated_duration}</span>
                      </div>
                      <p className="text-sm">{quote.description}</p>
                      {quote.valid_until && (
                        <p className="text-xs text-muted-foreground">
                          Valid until: {new Date(quote.valid_until).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleQuoteAction(quote.id, 'accepted')}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Accept Quote
                      </Button>
                      <Button variant="outline" onClick={() => handleQuoteAction(quote.id, 'rejected')}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {completedBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No booking history yet</p>
                </CardContent>
              </Card>
            ) : (
              completedBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{booking.service_type}</CardTitle>
                        <CardDescription>
                          {booking.service_providers?.business_name}
                        </CardDescription>
                      </div>
                      <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">{new Date(booking.scheduled_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-medium">${booking.total_price}</p>
                      </div>
                    </div>
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
