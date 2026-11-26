"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
  yOffset?: number;
  duration?: number;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  yOffset = 32,
  duration = 0.55,
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const dirMap = {
    up: { y: yOffset, x: 0 },
    left: { x: -24, y: 0 },
    right: { x: 24, y: 0 },
  };
  const hiddenVars = { opacity: 0, ...dirMap[direction] };

  return (
    <motion.div
      ref={ref}
      initial={hiddenVars}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : hiddenVars}
      transition={{ duration, delay, ease: EASE_OUT_EXPO }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  staggerDelay?: number;
}

export function StaggerReveal({
  children,
  className,
  stagger,
  staggerDelay = 0.1,
}: StaggerRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const effectiveStagger = stagger ?? staggerDelay;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: effectiveStagger,
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: EASE_OUT_EXPO,
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
