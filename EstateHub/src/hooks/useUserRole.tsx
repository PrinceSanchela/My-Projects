import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "builder" | "buyer" | "customer" | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching role:", error);
        setRole(null);
      } else {
        setRole(data?.role as UserRole);
      }
    } catch (error) {
      console.error("Error:", error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  return { role, loading, refetch: fetchUserRole };
};
