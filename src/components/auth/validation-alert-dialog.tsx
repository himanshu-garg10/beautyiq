"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ValidationAlertState {
  isOpen: boolean;
  title: string;
  message: string;
  suggestionAction?: {
    label: string;
    onClick: () => void;
  };
}

interface ValidationAlertDialogProps {
  state: ValidationAlertState;
  onClose: () => void;
}

export function ValidationAlertDialog({ state, onClose }: ValidationAlertDialogProps) {
  if (!state.isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Dark backdrop with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Modal card */}
        <motion.div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="validation-alert-title"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-sm rounded-3xl border border-line bg-background-card p-6 shadow-2xl text-center space-y-4"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shadow-subtle">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-1.5">
            <h3 id="validation-alert-title" className="font-display text-lg font-bold text-foreground">
              {state.title}
            </h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              {state.message}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {state.suggestionAction && (
              <Button
                type="button"
                variant="accent"
                size="md"
                onClick={() => {
                  state.suggestionAction?.onClick();
                  onClose();
                }}
                className="w-full font-semibold"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {state.suggestionAction.label}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              className="w-full text-xs font-semibold"
            >
              Close &amp; Fix
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
