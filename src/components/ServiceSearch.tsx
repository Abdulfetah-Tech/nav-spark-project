import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface ServiceSearchProps {
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  serviceType?: string;
  minRating?: number;
  maxPrice?: number;
  searchTerm?: string;
}

const serviceTypes = [
  "All Services",
  "Plumbing",
  "Electrical",
  "Painting",
  "Carpentry",
  "Cleaning",
  "HVAC",
  "Landscaping"
];

export const ServiceSearch = ({ onSearch }: ServiceSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceType, setServiceType] = useState("All Services");
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);

  const handleSearch = () => {
    onSearch({
      searchTerm: searchTerm || undefined,
      serviceType: serviceType !== "All Services" ? serviceType : undefined,
      minRating: minRating > 0 ? minRating : undefined,
      maxPrice: maxPrice < 500 ? maxPrice : undefined
    });
  };

  const handleReset = () => {
    setSearchTerm("");
    setServiceType("All Services");
    setMinRating(0);
    setMaxPrice(500);
    onSearch({});
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <h3 className="text-xl font-semibold text-foreground">Find Services</h3>
      
      <div className="space-y-4">
        <div>
          <Label>Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by business name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label>Service Type</Label>
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Minimum Rating: {minRating.toFixed(1)} ⭐</Label>
          <Slider
            value={[minRating]}
            onValueChange={(value) => setMinRating(value[0])}
            min={0}
            max={5}
            step={0.5}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Maximum Price: ${maxPrice}</Label>
          <Slider
            value={[maxPrice]}
            onValueChange={(value) => setMaxPrice(value[0])}
            min={0}
            max={500}
            step={10}
            className="mt-2"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSearch} className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={handleReset} variant="outline">
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};
