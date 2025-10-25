import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Home, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import heroImage from "@/assets/hero-home.jpg";
import { motion, useScroll, useTransform } from "framer-motion";
import { Variants, Target } from "framer-motion";

// Helper function to split text into letters
const splitText = (text: string) => text.split("").map((char, index) => ({ char, id: index }));

const Hero = () => {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState("");

  const handleSearch = () => navigate("/properties");

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }, // Stagger letters
  };

  const letter: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // Scroll-based parallax & fade
  const { scrollY } = useScroll();
  const yBackground = useTransform(scrollY, [0, 500], [0, -100]);
  const opacityBackground = useTransform(scrollY, [0, 400], [1, 0.4]);
  const yHeading = useTransform(scrollY, [0, 500], [0, -30]);
  const yParagraph = useTransform(scrollY, [0, 500], [0, -15]);
  const ySearchBox = useTransform(scrollY, [0, 500], [0, -10]);

  const floatY: Target = {
    y: [0, -6, 0],
  } as const; // tell TS this is just keyframes

  const floatTransition = {
    duration: 2,
    repeat: Infinity,
    repeatType: "loop" as const,
    ease: "easeInOut" as const,
  };

  const headingText = "Find Your Dream Home";

  return (
    <motion.section
      className="relative min-h-[600px] flex items-center justify-center overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      {/* Background */}
      <motion.div
        className="absolute inset-0"
        style={{ y: yBackground, opacity: opacityBackground }}
      >
        <motion.img
          src={heroImage}
          alt="Luxury real estate"
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ opacity: 0.85 }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 container mx-auto px-4 py-20"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Heading & Paragraph */}
        <motion.div className="max-w-4xl mx-auto text-center text-white mb-8">
          {/* Animated Heading */}
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4 text-balance flex justify-center flex-wrap"
            style={{ y: yHeading }}
            variants={container}
          >
            {splitText(headingText).map(({ char, id }) => (
              <motion.span key={id} variants={letter} className="inline-block">
                {char === " " ? "\u00A0" : char} {/* preserve spaces */}
              </motion.span>
            ))}
          </motion.h1>

          {/* Paragraph */}
          <motion.p
            className="text-lg md:text-xl text-white/90 mb-8"
            style={{ y: yParagraph }}
            variants={item}
          >
            Discover the perfect property from thousands of listings
          </motion.p>
        </motion.div>

        {/* Search Box */}
        <motion.div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-6" variants={item} style={{ y: ySearchBox }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Location */}
            <motion.div className="relative" variants={item}>
              <motion.div animate={floatY} transition={floatTransition} className="absolute left-3 top-1/2 -translate-y-1/2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </motion.div>
              <Input
                placeholder="City or Address"
                className="pl-10 h-12 border-border"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </motion.div>

            {/* Property Type */}
            <motion.div variants={item}>
              <Select>
                <SelectTrigger className="h-12 flex items-center gap-2">
                  <motion.div animate={floatY} transition={floatTransition}>
                    <Home className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Price Range */}
            <motion.div variants={item}>
              <Select>
                <SelectTrigger className="h-12 flex items-center gap-2">
                  <motion.div animate={floatY} transition={floatTransition}>
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-100k">$0 - $100k</SelectItem>
                  <SelectItem value="100k-300k">$100k - $300k</SelectItem>
                  <SelectItem value="300k-500k">$300k - $500k</SelectItem>
                  <SelectItem value="500k-1m">$500k - $1M</SelectItem>
                  <SelectItem value="1m+">$1M+</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Search Button */}
            <motion.div variants={item}>
              <motion.button
                onClick={handleSearch}
                className="h-12 bg-accent hover:bg-accent/90 text-white w-full rounded-lg flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Search className="h-5 w-5" />
                Search
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default Hero;
