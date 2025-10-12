import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface FooterProps {
    brandName?: string;
    brandLink?: string;
    bannerText?: string;
    logoSrc?: string;
}

export const Footer: React.FC<FooterProps> = ({
    brandName = "Prince Sanchela",
    brandLink = "https://prince-sanchela.vercel.app/",
    bannerText = "Check out My Portfolio",
    logoSrc = "/logo.png",
}) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
    const [showTopButton, setShowTopButton] = useState(false);

    // Scroll-triggered footer animation
    useEffect(() => {
        if (inView) {
            controls.start({ opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } });
        }
    }, [controls, inView]);

    // Show Scroll-to-Top button on scroll
    useEffect(() => {
        const handleScroll = () => {
            setShowTopButton(window.scrollY > 300); // Show after scrolling 300px
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <motion.footer
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-6 shadow-inner w-full sticky bottom-0 z-50"
        >
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 relative">

                {/* Brand Logo and Name */}
                <a
                    href={brandLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:scale-105 transition-transform duration-300"
                >
                    <img
                        src={logoSrc}
                        alt={`${brandName} Logo`}
                        className="h-8 w-8 md:h-10 md:w-10 object-contain rounded-[1rem]"
                    />
                    <span className="font-semibold text-lg md:text-xl">{brandName}</span>
                </a>

                {/* Pulsing Animated Brand Banner */}
                <a href={brandLink}
                    target="_blank"
                    className="text-white bg-gradient-primary hover:opacity-90 transition-opacity shadow-lg px-5 py-2 rounded-lg"
                >  Check out My Portfolio
                </a>
                {/* Footer Info */}
                <p className="text-sm md:text-base text-center md:text-left">
                    &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
                </p>

                {/* Scroll to Top Button */}
                {showTopButton && (
                    <motion.button
                        onClick={scrollToTop}
                        className="absolute right-4 bottom-16 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.1 }}
                    >
                        ↑
                    </motion.button>
                )}
            </div>
        </motion.footer>
    );
};
