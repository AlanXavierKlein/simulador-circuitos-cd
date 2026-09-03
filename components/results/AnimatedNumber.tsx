"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

export function formatMeasurement(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  }).format(Math.abs(value) < 1e-10 ? 0 : value);
}

export function AnimatedNumber({ value }: { value: number }) {
  const animatedValue = useMotionValue(value);
  const displayValue = useTransform(animatedValue, formatMeasurement);

  useEffect(() => {
    const controls = animate(animatedValue, value, {
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [animatedValue, value]);

  return (
    <motion.span aria-label={formatMeasurement(value)}>
      {displayValue}
    </motion.span>
  );
}
