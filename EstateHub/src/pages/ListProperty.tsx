import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";
import { z } from "zod";
import { useUserRole } from "@/hooks/useUserRole";

const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  type: z.string().min(1, "Property type is required"),
  price: z.number().positive("Price must be positive"),
  location: z.string().min(3, "Location is required"),
  bedrooms: z.number().positive("Bedrooms must be positive").int(),
  bathrooms: z.number().positive("Bathrooms must be positive"),
  area: z.number().positive("Area must be positive"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
  status: z.enum(["sale", "rent"]),
});

const ListProperty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { role, loading: roleLoading } = useUserRole();
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: "",
    status: "sale",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to list a property",
          variant: "destructive",
        });
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  useEffect(() => {
    if (!roleLoading && role !== "builder" && role !== "admin") {
      toast({
        title: "Access Denied",
        description: "Only builders and admins can list properties.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [role, roleLoading, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to list a property",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate form data
      const validatedData = propertySchema.parse({
        title: formData.title,
        type: formData.type,
        price: parseFloat(formData.price),
        location: formData.location,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        area: parseFloat(formData.area),
        description: formData.description,
        status: formData.status as "sale" | "rent",
      });

      const { error } = await supabase.from("properties").insert({
        user_id: session.user.id,
        title: validatedData.title,
        type: validatedData.type,
        price: validatedData.price,
        location: validatedData.location,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        area: validatedData.area,
        description: validatedData.description,
        status: validatedData.status,
        featured: false,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your property has been listed successfully",
      });

      navigate("/properties");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to list property. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Home className="h-8 w-8 text-accent" />
              <h1 className="text-4xl font-bold text-foreground">List Your Property</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Fill in the details below to list your property
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
              <CardDescription>Provide accurate information about your property</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Modern Downtown Apartment"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Property Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Villa">Villa</SelectItem>
                        <SelectItem value="Condo">Condo</SelectItem>
                        <SelectItem value="Penthouse">Penthouse</SelectItem>
                        <SelectItem value="Townhouse">Townhouse</SelectItem>
                        <SelectItem value="Cabin">Cabin</SelectItem>
                        <SelectItem value="Loft">Loft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Listing Type *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">For Sale</SelectItem>
                        <SelectItem value="rent">For Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ({formData.status === "rent" ? "per month" : "total"}) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 450000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., New York, NY"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms *</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      placeholder="e.g., 2"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms *</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      step="0.5"
                      placeholder="e.g., 2"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Area (sq ft) *</Label>
                    <Input
                      id="area"
                      type="number"
                      placeholder="e.g., 1200"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your property in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "List Property"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/properties")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListProperty;
