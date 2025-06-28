"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Info, AlertTriangle, XCircle } from "lucide-react";

type ToastProps = {
  message: string;
  title?: string;
  type?: "success" | "error" | "info" | "warning";
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
};

export function Toast({
  title,
  message,
  type = "info",
  onClose,
  actionLabel,
  onAction,
}: ToastProps) {
  const borderColors = {
    success: "border-l-green-500",
    error: "border-l-red-500",
    info: "border-l-blue-500",
    warning: "border-l-yellow-400",
  };

  const actionButtonColors = {
    success: "bg-green-600 hover:bg-green-700 text-white",
    error: "bg-red-600 hover:bg-red-700 text-white",
    info: "bg-blue-600 hover:bg-blue-700 text-white",
    warning: "bg-yellow-400 hover:bg-yellow-500 text-black",
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.3 }}
        className={`flex flex-col rounded-lg border-l-4 px-4 py-3 shadow-lg 
        bg-neutral-900 text-neutral-100 ${borderColors[type]}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {icons[type]}
            {title && <strong className="text-sm font-semibold">{title}</strong>}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-neutral-400 hover:text-neutral-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Linha divisória */}
        <div className="border-b border-neutral-700 my-2"></div>

        {/* Conteúdo */}
        <div className="flex flex-col gap-2">
          <span className="text-sm">{message}</span>

          {actionLabel && (
            <div className="flex gap-3 justify-end mt-2">
              {/* Botão de Ação */}
              <button
                onClick={() => {
                  onAction?.();
                  onClose();
                }}
                className={`px-3 py-1 rounded-md text-sm font-medium transition 
              ${actionButtonColors[type]}`}
              >
                {actionLabel}
              </button>

              {/* Botão de Cancelar */}
              <button
                onClick={onClose}
                className="px-3 py-1 rounded-md text-sm font-medium border border-neutral-600 text-neutral-300 hover:bg-neutral-700 transition"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
