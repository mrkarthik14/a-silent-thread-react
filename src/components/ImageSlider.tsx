import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ImageSliderProps {
  images: string[];
  onImageClick: (url: string) => void;
}

export function ImageSlider({ images, onImageClick }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="relative mb-3 group overflow-hidden rounded-xl">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="overflow-hidden rounded-xl"
        >
          <img
            src={images[currentIndex]}
            alt={`Post image ${currentIndex + 1}`}
            className="rounded-xl w-full object-cover max-h-64 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onImageClick(images[currentIndex])}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={goToNext}
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </Button>

          {/* Image Counter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg"
          >
            {currentIndex + 1}/{images.length}
          </motion.div>

          {/* Dot Indicators */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? "bg-white w-6"
                    : "bg-white/50 w-2 hover:bg-white/70"
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}