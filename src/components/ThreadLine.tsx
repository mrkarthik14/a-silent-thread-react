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
      <div className={`absolute inset-0 ${color} opacity-40`} />
      {animated && (
        <motion.div
          className={`absolute ${color} ${vertical ? 'w-full h-8' : 'h-full w-8'}`}
          animate={vertical ? { y: [0, 50, 0] } : { x: [0, 50, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
}