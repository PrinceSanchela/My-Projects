import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Bed, Bath, Square, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Property } from "@/data/properties";
import { toast } from "sonner";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (price: number) => {
    if (property.status === "rent") {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${(price / 1000).toFixed(0)}k`;
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const handleViewDetails = () => {
    navigate(`/property/${property.id}`);
  };

  return (
    <div 
      className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border cursor-pointer"
      onClick={handleViewDetails}
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant="secondary" className="bg-white/90 text-primary">
            {property.type}
          </Badge>
          {property.featured && (
            <Badge className="bg-accent text-white">
              Featured
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-4 right-4 bg-white/90 hover:bg-white"
          onClick={handleFavorite}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
        </Button>

        {/* Status Badge */}
        <Badge 
          className="absolute bottom-4 left-4 uppercase"
          variant={property.status === "sale" ? "default" : "secondary"}
        >
          For {property.status}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Price */}
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-2xl font-bold text-accent">
            {formatPrice(property.price)}
          </h3>
        </div>

        {/* Title */}
        <h4 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
          {property.title}
        </h4>

        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground mb-4">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{property.location}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-4">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>{property.area} sqft</span>
          </div>
        </div>

        {/* View Details Button */}
        <Button 
          className="w-full mt-4 bg-primary hover:bg-primary/90"
          variant="default"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default PropertyCard;
