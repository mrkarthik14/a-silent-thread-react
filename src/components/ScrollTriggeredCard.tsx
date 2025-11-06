import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ReactNode } from "react";

interface ScrollTriggeredCardProps {
  children: ReactNode;
  index: number;
  emoji?: string;
}

export function ScrollTriggeredCard({ children, index, emoji }: ScrollTriggeredCardProps) {
  const cardVariants: Variants = {
    offscreen: {
      y: 300,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      rotate: -5,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
        delay: index * 0.1,
      },
    },
  };

  const splashStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    clipPath: `path("M 0 303.5 C 0 292.454 8.995 285.101 20 283.5 L 460 219.5 C 470.085 218.033 480 228.454 480 239.5 L 500 430 C 500 441.046 491.046 450 480 450 L 20 450 C 8.954 450 0 441.046 0 430 Z")`,
    background: `linear-gradient(306deg, hsl(${200 + index * 30}, 100%, 50%), hsl(${240 + index * 30}, 100%, 50%))`,
  };

  return (
    <motion.div
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ amount: 0.8, once: true }}
      variants={cardVariants}
      className="w-full relative overflow-hidden"
      style={{ paddingTop: 20, marginBottom: -120 }}
    >
      <div style={splashStyle} />
      <motion.div className="relative z-10">
        {children}
      </motion.div>
    </motion.div>
  );
}