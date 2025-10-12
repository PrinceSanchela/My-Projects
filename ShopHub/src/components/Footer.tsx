import React, { useState, useEffect } from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaArrowUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Footer: React.FC = () => {
    const [showTopBtn, setShowTopBtn] = useState(false);
    const [email, setEmail] = useState("");
    const [emailStatus, setEmailStatus] = useState<"idle" | "success" | "error">("idle");

    // Show Back to Top button after scrolling 300px
    useEffect(() => {
        const handleScroll = () => setShowTopBtn(window.scrollY > 300);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Scroll to top
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    // Newsletter submit with email validation
    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        const regex = /\S+@\S+\.\S+/;
        if (regex.test(email)) {
            setEmailStatus("success");
            setEmail("");
        } else {
            setEmailStatus("error");
        }
        setTimeout(() => setEmailStatus("idle"), 2000);
    };

    // Animations
    const fadeUp = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } };
    const floatAnimation = { y: [0, -5, 0, 5, 0], transition: { repeat: Infinity, duration: 6, ease: "easeInOut" } };
    const pulse = { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } };

    return (
        <footer className="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 text-gray-200 py-16 relative">
            <div className="container mx-auto px-6 md:px-12">
                {/* Main Footer Sections */}
                <motion.div
                    className="flex flex-col md:flex-row justify-between gap-12"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Brand & Description */}
                    <div className="md:w-1/3 relative">
                        <h1 className="text-3xl font-bold text-white mb-4">ShopHub</h1>
                        <p className="text-gray-300 mb-4">
                            Your ultimate destination for fashion, electronics, and accessories. Quality products delivered fast with excellent customer support.
                        </p>
                        <div className="flex gap-4 mt-2">
                            {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, idx) => (
                                <motion.a
                                    key={idx}
                                    href="#"
                                    // animate={floatAnimation}
                                    whileHover={{ scale: 1.2, rotate: 10, boxShadow: "0px 0px 15px rgba(255,192,203,0.8)" }}
                                    className="p-2 bg-gray-800 rounded-full transition-all duration-300"
                                >
                                    <Icon />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:w-1/5">
                        <h2 className="text-xl font-semibold text-white mb-4">Quick Links</h2>
                        <ul className="space-y-2">
                            {["Home", "Shop", "About Us", "Contact", "FAQs"].map((link, idx) => (
                                <motion.li key={idx} whileHover={{ x: 5, scale: 1.05 }} className="transition-transform duration-300">
                                    <a className="hover:text-white transition duration-300" href="#">{link}</a>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Support */}
                    <div className="md:w-1/5">
                        <h2 className="text-xl font-semibold text-white mb-4">Customer Support</h2>
                        <ul className="space-y-2">
                            {["Shipping & Delivery", "Returns & Exchanges", "Payment Options", "Privacy Policy", "Terms & Conditions"].map((link, idx) => (
                                <motion.li key={idx} whileHover={{ x: 5, scale: 1.05 }} className="transition-transform duration-300">
                                    <a className="hover:text-white transition duration-300" href="#">{link}</a>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="md:w-1/3 relative">
                        <h2 className="text-xl font-semibold text-white mb-4">Subscribe to our Newsletter &nbsp;&nbsp;</h2>
                        <p className="text-gray-300 mb-4">
                            Get updates, offers, and discounts delivered straight to your inbox.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-2 relative group" onSubmit={handleSubscribe}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className={`w-full px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 transition-all duration-500 ${emailStatus === "success" ? "focus:ring-green-400" :
                                    emailStatus === "error" ? "focus:ring-red-400" :
                                        "focus:ring-pink-500"
                                    }`}
                            />
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.05, y: -2, boxShadow: "0px 0px 15px rgba(255,192,203,0.6)" }}
                                className="bg-pink-500 text-white px-6 py-3 rounded-md transition-all duration-300"
                            >
                                Subscribe
                            </motion.button>
                        </form>

                        <AnimatePresence>
                            {emailStatus === "success" && (
                                <motion.p
                                    className="text-green-400 mt-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    Successfully subscribed! 🎉
                                </motion.p>
                            )}
                            {emailStatus === "error" && (
                                <motion.p
                                    className="text-red-400 mt-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    Invalid email address!
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Bottom */}
                <motion.div
                    className="mt-16 border-t border-gray-700 pt-6 text-center text-gray-400 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    &copy; {new Date().getFullYear()} ShopHub. All rights reserved. Made By Prince Sanchela
                </motion.div>

                {/* Back to Top Button */}
                <AnimatePresence>
                    {showTopBtn && (
                        <motion.button
                            onClick={scrollToTop}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            whileHover={{ scale: 1.2, rotate: 10, boxShadow: "0px 0px 25px rgba(255,192,203,0.8)" }}
                            className="fixed bottom-8 right-8 bg-pink-500 text-white p-4 rounded-full shadow-lg z-50 transition-all duration-300"
                        >
                            <FaArrowUp />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </footer>
    );
};

export default Footer;
