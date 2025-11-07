import { motion, MotionValue, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { Children, cloneElement, useRef, useState, useEffect, useMemo } from "react";
import { Share2, MessageCircle, Mail, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type ShareDockItemData = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
};

type ShareDockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  distance: number;
  baseItemSize: number;
  magnification: number;
};

function ShareDockItem({
  children,
  className = "",
  onClick,
  mouseX,
  distance,
  magnification,
  baseItemSize,
}: ShareDockItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size,
      }}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-full bg-white border-2 border-slate-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  );
}

interface ShareDockProps {
  items: ShareDockItemData[];
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDock({ items, isOpen, onClose }: ShareDockProps) {
  const mouseX = useMotionValue(Infinity);
  const baseItemSize = 50;
  const magnification = 70;
  const distance = 200;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.8 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
      onMouseMove={({ pageX }) => mouseX.set(pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      <motion.div
        className="flex items-end gap-4 rounded-3xl border-2 border-slate-200 bg-white/95 backdrop-blur-sm shadow-2xl pb-3 px-4 py-2"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ShareDockItem
              onClick={item.onClick}
              mouseX={mouseX}
              distance={distance}
              magnification={magnification}
              baseItemSize={baseItemSize}
              className={item.color}
            >
              <div className="flex items-center justify-center text-slate-700">
                {item.icon}
              </div>
            </ShareDockItem>
          </motion.div>
        ))}

        <motion.button
          onClick={onClose}
          className="ml-2 p-2 hover:bg-slate-100 rounded-full transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
