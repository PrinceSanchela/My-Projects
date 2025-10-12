import { Star, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    original_price?: number;
    image_url?: string;
    rating?: number;
    reviews_count?: number;
    is_featured?: boolean;
  };
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to cart",
      });
      navigate("/auth");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("cart_items")
      .upsert(
        { 
          user_id: user.id, 
          product_id: product.id, 
          quantity: 1 
        },
        { 
          onConflict: "user_id,product_id",
          ignoreDuplicates: false 
        }
      );

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Added to cart",
        description: `${product.name} added to your cart`,
      });
    }
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-blue-500/10">
            <ShoppingCart className="h-20 w-20 text-muted-foreground/20" />
          </div>
        )}
        {product.is_featured && (
          <Badge className="absolute top-2 left-2 bg-secondary">Featured</Badge>
        )}
        {discount > 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            -{discount}%
          </Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem]">{product.name}</h3>
        
        {product.rating && product.rating > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({product.reviews_count})</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">${product.price}</span>
          {product.original_price && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.original_price}
            </span>
          )}
        </div>

        <Button 
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-blue-500 hover:opacity-90"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};
