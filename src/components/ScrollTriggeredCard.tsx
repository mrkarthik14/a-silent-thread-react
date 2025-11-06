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

  return (
    <motion.div
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ amount: 0.8, once: true }}
      variants={cardVariants}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
