import { useEffect, useState } from "react";
import { Home, Users, Award, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Easing function (easeOutCubic)
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const Stats = () => {
  const stats = [
    { icon: Home, value: 10000, label: "Properties Listed" },
    { icon: Users, value: 5000, label: "Happy Clients" },
    { icon: Award, value: 15, label: "Years Experience" },
    { icon: MapPin, value: 50, label: "Cities Covered" },
  ];

  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.3 });
  const [animatedValues, setAnimatedValues] = useState<number[]>(stats.map(() => 0));

  useEffect(() => {
    if (!inView) return;

    const duration = 1300; // animation duration in ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1); // 0 → 1
      const easedProgress = easeOutCubic(progress);

      const newValues = stats.map((s) => Math.floor(s.value * easedProgress));
      setAnimatedValues(newValues);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [inView]); // re-run every time section enters viewport

  return (
    <section className="py-16 bg-primary text-primary-foreground" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-accent/20 rounded-full">
                    <Icon className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-1">
                  {animatedValues[index].toLocaleString()}+
                </div>
                <div className="text-sm text-primary-foreground/80">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;
