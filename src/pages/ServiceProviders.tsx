import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ServiceSearch, SearchFilters } from "@/components/ServiceSearch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Star, MapPin, DollarSign, Calendar } from "lucide-react";

interface Provider {
  id: string;
  business_name: string;
  service_type: string;
  description: string;
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  service_area: string;
  years_experience: number;
}

export default function ServiceProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [bookingForm, setBookingForm] = useState({
    scheduled_date: "",
    notes: "",
    estimated_hours: 1
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    const { data, error } = await supabase
      .from("service_providers")
      .select("*")
      .eq("verified", true)
      .order("rating", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else if (data) {
      setProviders(data);
      setFilteredProviders(data);
    }
    setLoading(false);
  };

  const handleSearch = (filters: SearchFilters) => {
    let filtered = [...providers];

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.business_name.toLowerCase().includes(term) ||
        p.service_area?.toLowerCase().includes(term)
      );
    }

    if (filters.serviceType) {
      filtered = filtered.filter(p => p.service_type === filters.serviceType);
    }

    if (filters.minRating) {
      filtered = filtered.filter(p => Number(p.rating) >= filters.minRating!);
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(p => Number(p.hourly_rate) <= filters.maxPrice!);
    }

    setFilteredProviders(filtered);
  };

  const handleBooking = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a service.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    if (!selectedProvider) return;

    const totalPrice = Number(selectedProvider.hourly_rate) * bookingForm.estimated_hours;

    const { error } = await supabase.from("bookings").insert({
      customer_id: user.id,
      provider_id: selectedProvider.id,
      service_type: selectedProvider.service_type,
      scheduled_date: new Date(bookingForm.scheduled_date).toISOString(),
      total_price: totalPrice,
      notes: bookingForm.notes,
      status: 'pending'
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Booking requested!",
        description: "The provider will review your request and send you a quote."
      });
      setBookingDialogOpen(false);
      setBookingForm({ scheduled_date: "", notes: "", estimated_hours: 1 });
      navigate("/customer-dashboard");
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
        <h1 className="text-4xl font-bold text-foreground mb-8">Find Service Providers</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <ServiceSearch onSearch={handleSearch} />
          </div>

          <div className="lg:col-span-3 space-y-4">
            {filteredProviders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No providers found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredProviders.map((provider) => (
                <Card key={provider.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{provider.business_name}</CardTitle>
                        <CardDescription>{provider.service_type}</CardDescription>
                      </div>
                      <Badge variant="default">{provider.years_experience || 0}+ years</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        <span className="text-sm">{Number(provider.rating).toFixed(1)} ({provider.total_reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm">${provider.hourly_rate}/hr</span>
                      </div>
                      {provider.service_area && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm">{provider.service_area}</span>
                        </div>
                      )}
                    </div>

                    <Dialog open={bookingDialogOpen && selectedProvider?.id === provider.id} onOpenChange={setBookingDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setSelectedProvider(provider)}>Request Service</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Request Service from {provider.business_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Preferred Date</Label>
                            <Input
                              type="date"
                              value={bookingForm.scheduled_date}
                              onChange={(e) => setBookingForm({ ...bookingForm, scheduled_date: e.target.value })}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div>
                            <Label>Estimated Hours</Label>
                            <Input
                              type="number"
                              min="1"
                              value={bookingForm.estimated_hours}
                              onChange={(e) => setBookingForm({ ...bookingForm, estimated_hours: parseInt(e.target.value) || 1 })}
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                              Estimated cost: ${(Number(provider.hourly_rate) * bookingForm.estimated_hours).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <Label>Additional Notes</Label>
                            <Textarea
                              value={bookingForm.notes}
                              onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                              placeholder="Describe what you need help with..."
                            />
                          </div>
                          <Button onClick={handleBooking} className="w-full">
                            <Calendar className="mr-2 h-4 w-4" />
                            Request Booking
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
