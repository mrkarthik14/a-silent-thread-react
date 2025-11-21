import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function ThemeTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Observe class changes on document.documentElement
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const isDark = document.documentElement.classList.contains("dark");
          const newTheme = isDark ? "dark" : "light";
          
          if (newTheme !== theme) {
            setTheme(newTheme);
            setIsTransitioning(true);
            setTimeout(() => setIsTransitioning(false), 800);
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Initial state
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");

    return () => observer.disconnect();
  }, [theme]);

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          initial={{ clipPath: "circle(0% at 100% 0%)" }}
          animate={{ clipPath: "circle(150% at 100% 0%)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] pointer-events-none"
          style={{
            background: theme === "dark" 
              ? "linear-gradient(135deg, #0d0d0f 0%, #1a1a20 100%)" 
              : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
          }}
        >
          <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
