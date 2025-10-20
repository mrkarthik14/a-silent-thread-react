import { motion } from "framer-motion";

interface LoadingLogoProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  variant?: "default" | "handshake";
}

export function LoadingLogo({ size = "md", text, variant = "default" }: LoadingLogoProps) {
  const sizeMap = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
  };

  const containerSizeMap = {
    sm: "w-16 h-16",
    md: "w-28 h-28",
    lg: "w-40 h-40",
  };

  if (variant === "handshake") {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          {/* Outer glow animation */}
          <motion.div
            className={`${containerSizeMap[size]} absolute rounded-full`}
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(168, 85, 247, 0.7)",
                "0 0 0 20px rgba(168, 85, 247, 0)",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* Inner rotating glow */}
          <motion.div
            className={`${containerSizeMap[size]} absolute rounded-full border-2 border-transparent`}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{
              borderImage: "linear-gradient(45deg, #a855f7, #3b82f6, #a855f7) 1",
            }}
          />

          {/* Logo with handshake animation */}
          <motion.div
            className={sizeMap[size]}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            <img
              src="https://harmless-tapir-303.convex.cloud/api/storage/1d202220-a6f3-4d1f-bc57-9727f260a5f6"
              alt="Loading"
              className="w-full h-full object-contain"
            />
          </motion.div>

          {/* Particle effects around logo */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full"
              animate={{
                x: Math.cos((i / 4) * Math.PI * 2) * 60,
                y: Math.sin((i / 4) * Math.PI * 2) * 60,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {text && (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm text-slate-600"
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        {/* Outer glow animation */}
        <motion.div
          className={`${containerSizeMap[size]} absolute rounded-full`}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(168, 85, 247, 0.7)",
              "0 0 0 20px rgba(168, 85, 247, 0)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Logo with pulse and scale animation */}
        <motion.div
          className={sizeMap[size]}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src="https://harmless-tapir-303.convex.cloud/api/storage/1d202220-a6f3-4d1f-bc57-9727f260a5f6"
            alt="Loading"
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* Particle effects around logo */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400 rounded-full"
            animate={{
              x: Math.cos((i / 4) * Math.PI * 2) * 50,
              y: Math.sin((i / 4) * Math.PI * 2) * 50,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
      </div>
      {text && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm text-slate-600"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}