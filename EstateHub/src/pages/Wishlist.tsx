import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { properties as staticProperties } from "@/data/properties";
import type { Session } from "@supabase/supabase-js";
import type { Property } from "@/data/properties";

const Wishlist = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [wishlistItems, setWishlistItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
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
  }, [navigate]);

  useEffect(() => {
    if (session) {
      fetchWishlist();
    }
  }, [session]);

  const fetchWishlist = async () => {
    if (!session) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("wishlists")
      .select("property_id")
      .eq("user_id", session.user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load wishlist",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Get property IDs from wishlist
    const propertyIds = data.map((item) => item.property_id);
    
    // Filter static properties that match wishlist IDs
    const wishlistProperties = staticProperties.filter((property) =>
      propertyIds.includes(property.id)
    );

    setWishlistItems(wishlistProperties);
    setLoading(false);
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-accent fill-accent" />
              <h1 className="text-4xl font-bold text-foreground">My Wishlist</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Your favorite properties saved for later
            </p>
          </div>

          {/* Wishlist Content */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading your wishlist...</p>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Start adding properties you love to your wishlist
              </p>
              <button
                onClick={() => navigate("/properties")}
                className="text-accent hover:underline"
              >
                Browse Properties
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishlistItems.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
