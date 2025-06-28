"use client";

import { easeInOut, motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";

interface FloatingButtonProps {
  children: React.ReactNode;
  action: () => Promise<void>;
  tooltip?: string;
  disabled?: boolean;
}

export function FloatingButton({
  children,
  action,
  tooltip = "Adicionar novo Core",
  disabled = false,
}: FloatingButtonProps) {
  const [hovering, setHovering] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tooltipVariants = {
    hidden: {
      opacity: 0,
      x: 20,
      scaleX: 0.8,
      filter: "blur(6px)",
      transformOrigin: "right center",
      transition: { duration: 0.25, ease: easeInOut },
    },
    visible: {
      opacity: 1,
      x: 0,
      scaleX: 1,
      filter: "blur(0px)",
      transformOrigin: "right center",
      transition: {
        type: "spring" as const,
        stiffness: 160,
        damping: 22,
        mass: 1,
        velocity: 2,
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      scaleX: 0.8,
      filter: "blur(6px)",
      transformOrigin: "right center",
      transition: { duration: 0.25, ease: easeInOut },
    },
  };

  function handleHoverStart() {
    timeoutRef.current = setTimeout(() => setHovering(true), 150);
  }

  function handleHoverEnd() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setHovering(false);
  }

  return (
    <form action={action}>
      <motion.div
        className="fixed bottom-6 right-6 z-50 flex items-center"
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
      >
        <AnimatePresence>
          {hovering && !disabled && (
            <motion.span
              variants={tooltipVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-sm text-lime-400 bg-neutral-900 rounded-l-full rounded-r-md px-4 py-2 font-semibold select-none shadow-md"
              style={{ userSelect: "none" }}
            >
              {tooltip}
            </motion.span>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          whileHover={
            disabled
              ? undefined
              : {
                  scale: 1.1,
                  boxShadow: "0 0 20px rgb(163 230 53)",
                  transition: { duration: 0.3 },
                }
          }
          whileTap={disabled ? undefined : { scale: 0.95 }}
          disabled={disabled}
          className={`inline-flex items-center justify-center
            rounded-full border border-lime-400
            bg-neutral-900 text-lime-400
            transition-colors duration-200
            w-14 h-14 text-2xl shadow-md select-none
            ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-lime-400 hover:text-neutral-900"
            }`}
        >
          {children}
        </motion.button>
      </motion.div>
    </form>
  );
}
