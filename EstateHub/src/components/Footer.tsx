import { Home, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-6 w-6 text-accent" />
              <span className="text-xl font-bold">EstateHub</span>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Your trusted partner in finding the perfect property. 
              Making real estate dreams come true since 2024.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="/" className="hover:text-accent transition-colors">Home</a></li>
              <li><a href="/properties" className="hover:text-accent transition-colors">Properties</a></li>
              <li><a href="/about" className="hover:text-accent transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-accent transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="font-semibold mb-4">Property Types</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="#" className="hover:text-accent transition-colors">Apartments</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Villas</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Houses</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Commercial</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@estatehub.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>123 Real Estate Ave<br />New York, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; 2024 EstateHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
