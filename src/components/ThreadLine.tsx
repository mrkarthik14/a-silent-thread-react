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
    <div className={`relative ${vertical ? 'h-full w-1' : 'w-full h-1'} ${className}`}>
      <div className={`absolute inset-0 ${color} opacity-30`} />
      {animated && (
        <motion.div
          className={`absolute ${color} ${vertical ? 'w-full h-12' : 'h-full w-12'} rounded-full blur-sm`}
          animate={vertical ? { y: [0, 80, 0] } : { x: [0, 80, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            boxShadow: vertical 
              ? "0 0 12px rgba(248, 165, 165, 0.6)" 
              : "0 0 12px rgba(248, 165, 165, 0.6)"
          }}
        />
      )}
    </div>
  );
}