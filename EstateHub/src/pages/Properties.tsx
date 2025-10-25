import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters from "@/components/PropertyFilters";
import { properties } from "@/data/properties";
import { Property } from "@/data/properties";

const Properties = () => {

  useEffect(() => {
    // ✅ Scroll to top whenever this page loads
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);

  const handleFilterChange = (filters: {
    type: string;
    status: string;
    priceRange: string;
    bedrooms: string;
    location: string;
  }) => {
    let filtered = [...properties];

    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter(p => p.type.toLowerCase() === filters.type.toLowerCase());
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    if (filters.bedrooms && filters.bedrooms !== "all") {
      const beds = parseInt(filters.bedrooms);
      filtered = filtered.filter(p => p.bedrooms >= beds);
    }

    if (filters.location) {
      filtered = filtered.filter(p =>
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.priceRange && filters.priceRange !== "all") {
      if (filters.priceRange === "1m+") {
        filtered = filtered.filter(p => p.price >= 1000000);
      } else {
        const [minStr, maxStr] = filters.priceRange.split("-");
        const min = parseInt(minStr.replace("k", "000"));
        const max = parseInt(maxStr.replace("k", "000"));
        filtered = filtered.filter(p => p.price >= min && p.price <= max);
      }
    }

    setFilteredProperties(filtered);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Page Header */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse Properties
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Discover {properties.length} amazing properties
            </p>
          </div>
        </section>

        {/* Filters and Listings */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <PropertyFilters onFilterChange={handleFilterChange} />
              </div>

              {/* Property Grid */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">
                    Showing {filteredProperties.length} properties
                  </p>
                </div>

                {filteredProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">
                      No properties found matching your criteria
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Properties;
