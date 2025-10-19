import { motion } from "framer-motion";

interface ThreadLineProps {
  color?: string;
  vertical?: boolean;
  animated?: boolean;
  className?: string;
}

export function ThreadLine({ 
  color = "bg-pink-300", 
  vertical = false, 
  animated = true,
  className = ""
}: ThreadLineProps) {
  return (
    <div className={`relative ${vertical ? 'h-full w-0.5' : 'w-full h-0.5'} ${className}`}>
      <div className={`absolute inset-0 ${color} opacity-30`} />
      {animated && (
        <motion.div
          className={`absolute ${color} ${vertical ? 'w-full h-4' : 'h-full w-4'}`}
          animate={vertical ? { y: [0, 100, 0] } : { x: [0, 100, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
}
