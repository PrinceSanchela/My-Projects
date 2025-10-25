import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { properties } from "@/data/properties";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Heart,
  Share2,
  Phone,
  Mail,
  Calendar,
  Home,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const property = properties.find((p) => p.id === Number(id));

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <Button onClick={() => navigate("/properties")}>
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (property.status === "rent") {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleContact = () => {
    toast.success("Agent will contact you soon!");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Back Button */}
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/properties")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Properties
          </Button>
        </div>

        {/* Hero Image Gallery */}
        <section className="container mx-auto px-4 mb-8">
          <div className="relative h-[500px] rounded-2xl overflow-hidden">
            <img
              src={property.image}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-6 left-6 flex gap-2">
              <Badge variant="secondary" className="bg-white/90 text-primary">
                {property.type}
              </Badge>
              <Badge
                className="uppercase"
                variant={property.status === "sale" ? "default" : "secondary"}
              >
                For {property.status}
              </Badge>
            </div>
            <div className="absolute top-6 right-6 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/90 hover:bg-white"
                onClick={handleFavorite}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/90 hover:bg-white"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Property Details */}
        <section className="container mx-auto px-4 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title and Price */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-5 w-5" />
                      <span className="text-lg">{property.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-accent">
                      {formatPrice(property.price)}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-6 py-6 border-y border-border">
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{property.bedrooms}</span>
                    <span className="text-muted-foreground">Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{property.bathrooms}</span>
                    <span className="text-muted-foreground">Bathrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{property.area}</span>
                    <span className="text-muted-foreground">sqft</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{property.type}</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="space-y-4 pt-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    This exceptional property offers an unparalleled living experience with its
                    modern design, premium finishes, and prime location. Perfect for those seeking
                    luxury and comfort in a vibrant neighborhood.
                  </p>
                </TabsContent>
                <TabsContent value="features" className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      "Air Conditioning",
                      "Heating",
                      "Parking",
                      "Swimming Pool",
                      "Gym/Fitness Center",
                      "Security System",
                      "Balcony/Terrace",
                      "Garden",
                      "Smart Home",
                      "Elevator",
                      "Storage",
                      "Pet Friendly",
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-accent"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="location" className="pt-4">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Located in {property.location}, this property is situated in one of the most
                      desirable neighborhoods, offering easy access to amenities, transportation,
                      and entertainment options.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        Map integration coming soon
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Contact Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">Contact Agent</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        JD
                      </div>
                      <div>
                        <p className="font-semibold">John Doe</p>
                        <p className="text-sm text-muted-foreground">Real Estate Agent</p>
                      </div>
                    </div>

                    <Button className="w-full gap-2" size="lg" onClick={handleContact}>
                      <Phone className="h-4 w-4" />
                      Call Agent
                    </Button>

                    <Button variant="outline" className="w-full gap-2" onClick={handleContact}>
                      <Mail className="h-4 w-4" />
                      Send Message
                    </Button>

                    <Button variant="outline" className="w-full gap-2" onClick={handleContact}>
                      <Calendar className="h-4 w-4" />
                      Schedule Visit
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2">
                    <p className="text-sm text-muted-foreground">Property ID: #{property.id}</p>
                    <p className="text-sm text-muted-foreground">Listed: 2 weeks ago</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetail;
