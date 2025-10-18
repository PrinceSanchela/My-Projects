import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PreloaderProps {
    onFinish: () => void;
}

const typingText = "Prince Sanchela's Projects"; // ✅ Correct string

const Preloader: React.FC<PreloaderProps> = ({ onFinish }) => {
    const [displayText, setDisplayText] = useState(""); // typed letters
    const [showCursor, setShowCursor] = useState(false);
    const [zoomOut, setZoomOut] = useState(false);

    useEffect(() => {
        let index = 0;
        const typingSpeed = 100; // ms per letter
        const cursorHold = 500; // cursor visible after typing
        const postDelay = 2000; // extra delay before fade-out
        const fadeOutDuration = 800;

        // Typing interval
        const typingInterval = setInterval(() => {
            if (index < typingText.length) {
                setDisplayText((prev) => typingText.slice(0, index + 1));
                index++;
            } else {
                clearInterval(typingInterval);

                // Show blinking cursor
                setShowCursor(true);

                // Zoom-out effect
                setTimeout(() => setZoomOut(true), cursorHold);
            }
        }, typingSpeed);

        // Total duration before calling onFinish
        const totalDuration =
            typingText.length * typingSpeed + cursorHold + postDelay + fadeOutDuration;

        const finishTimer = setTimeout(() => onFinish(), totalDuration);

        return () => {
            clearInterval(typingInterval);
            clearTimeout(finishTimer);
        };
    }, [onFinish]);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-50"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            >
                {/* Logo */}
                <motion.img
                    src="/logo.png"
                    alt="Prince Logo"
                    className="w-24 h-24 mb-6"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{
                        scale: zoomOut ? 1.2 : 1,
                        rotate: zoomOut ? 20 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 120, damping: 12 }}
                />

                {/* Typing text */}
                <motion.h1
                    className="text-2xl md:text-3xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x flex"
                    animate={{ scale: zoomOut ? 1.1 : 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <span>{displayText}</span>
                    {showCursor && (
                        <motion.span
                            className="inline-block w-[2px] h-6 bg-blue-500 ml-1"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{
                                repeat: Infinity,
                                duration: 0.6,
                                ease: "easeInOut",
                            }}
                        />
                    )}
                </motion.h1>

                {/* Tagline */}
                <motion.p
                    className="text-gray-500 dark:text-gray-400 mt-3 text-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.8 }}
                >
                    Crafting ideas into experiences 🚀
                </motion.p>
            </motion.div>
        </AnimatePresence>
    );
};

export default Preloader;
