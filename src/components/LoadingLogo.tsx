import { motion } from "framer-motion";

interface LoadingLogoProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingLogo({ size = "md", text }: LoadingLogoProps) {
  const sizeMap = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className={sizeMap[size]}
      >
        <img
          src="https://harmless-tapir-303.convex.cloud/api/storage/1d202220-a6f3-4d1f-bc57-9727f260a5f6"
          alt="Loading"
          className="w-full h-full object-contain"
        />
      </motion.div>
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
