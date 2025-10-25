export interface Property {
  id: number;
  title: string;
  type: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  featured: boolean;
  status: "sale" | "rent";
  description: string;
}

export const properties: Property[] = [
  {
    id: 1,
    title: "Modern Downtown Apartment",
    type: "Apartment",
    price: 450000,
    location: "New York, NY",
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    image: "/src/assets/property-1.jpg",
    featured: true,
    status: "sale",
    description: "Stunning modern apartment with panoramic city views, high-end finishes, and luxury amenities."
  },
  {
    id: 2,
    title: "Luxury Suburban Villa",
    type: "Villa",
    price: 1250000,
    location: "Los Angeles, CA",
    bedrooms: 5,
    bathrooms: 4,
    area: 4500,
    image: "/src/assets/property-2.jpg",
    featured: true,
    status: "sale",
    description: "Exquisite villa with swimming pool, landscaped gardens, and modern architecture in a prime location."
  },
  {
    id: 3,
    title: "Elegant Penthouse Suite",
    type: "Penthouse",
    price: 2800000,
    location: "Miami, FL",
    bedrooms: 3,
    bathrooms: 3,
    area: 2800,
    image: "/src/assets/property-3.jpg",
    featured: true,
    status: "sale",
    description: "Breathtaking penthouse with 360-degree views, premium finishes, and exclusive amenities."
  },
  {
    id: 4,
    title: "Cozy Family Home",
    type: "House",
    price: 3500,
    location: "Austin, TX",
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    image: "/src/assets/property-1.jpg",
    featured: false,
    status: "rent",
    description: "Beautiful family home with spacious backyard, modern kitchen, and great neighborhood."
  },
  {
    id: 5,
    title: "Downtown Studio Loft",
    type: "Apartment",
    price: 2200,
    location: "San Francisco, CA",
    bedrooms: 1,
    bathrooms: 1,
    area: 750,
    image: "/src/assets/property-2.jpg",
    featured: false,
    status: "rent",
    description: "Modern studio loft in the heart of downtown with exposed brick and high ceilings."
  },
  {
    id: 6,
    title: "Waterfront Condo",
    type: "Condo",
    price: 890000,
    location: "Seattle, WA",
    bedrooms: 2,
    bathrooms: 2,
    area: 1400,
    image: "/src/assets/property-3.jpg",
    featured: false,
    status: "sale",
    description: "Stunning waterfront condo with private balcony and marina access."
  },
  {
    id: 7,
    title: "Mountain View Cabin",
    type: "Cabin",
    price: 4200,
    location: "Denver, CO",
    bedrooms: 3,
    bathrooms: 2,
    area: 1600,
    image: "/src/assets/property-1.jpg",
    featured: false,
    status: "rent",
    description: "Cozy cabin with breathtaking mountain views, perfect for nature lovers."
  },
  {
    id: 8,
    title: "Urban Townhouse",
    type: "Townhouse",
    price: 725000,
    location: "Boston, MA",
    bedrooms: 3,
    bathrooms: 2,
    area: 2000,
    image: "/src/assets/property-2.jpg",
    featured: false,
    status: "sale",
    description: "Modern townhouse in historic neighborhood with rooftop terrace."
  },
  {
    id: 9,
    title: "Beachfront Villa",
    type: "Villa",
    price: 2950000,
    location: "San Diego, CA",
    bedrooms: 4,
    bathrooms: 4,
    area: 3500,
    image: "/src/assets/property-3.jpg",
    featured: true,
    status: "sale",
    description: "Luxurious beachfront villa with private beach access and infinity pool."
  },
  {
    id: 10,
    title: "Downtown Loft",
    type: "Loft",
    price: 3800,
    location: "Chicago, IL",
    bedrooms: 2,
    bathrooms: 2,
    area: 1500,
    image: "/src/assets/property-1.jpg",
    featured: false,
    status: "rent",
    description: "Industrial loft with high ceilings and exposed brick in trendy neighborhood."
  },
  {
    id: 11,
    title: "Suburban Family Home",
    type: "House",
    price: 650000,
    location: "Portland, OR",
    bedrooms: 4,
    bathrooms: 3,
    area: 2500,
    image: "/src/assets/property-2.jpg",
    featured: false,
    status: "sale",
    description: "Spacious family home with large backyard and modern amenities."
  },
  {
    id: 12,
    title: "Luxury Penthouse",
    type: "Penthouse",
    price: 3200000,
    location: "Las Vegas, NV",
    bedrooms: 4,
    bathrooms: 4,
    area: 3200,
    image: "/src/assets/property-3.jpg",
    featured: true,
    status: "sale",
    description: "Spectacular penthouse with panoramic city views and world-class amenities."
  }
];
