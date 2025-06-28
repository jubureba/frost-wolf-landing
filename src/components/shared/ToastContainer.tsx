"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { Toast } from "./Toast";
import { AnimatePresence } from "framer-motion";

type ToastMessage = {
  id: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastContextType = {
  showToast: (
    message: string,
    type?: "success" | "error" | "info" | "warning",
    options?: {
      actionLabel?: string;
      onAction?: () => void;
    }
  ) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const titles = {
    success: "Sucesso",
    error: "Erro",
    info: "Informação",
    warning: "Atenção",
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
    options?: {
      actionLabel?: string;
      onAction?: () => void;
    }
  ) => {
    const id = crypto.randomUUID();

    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type,
        actionLabel: options?.actionLabel,
        onAction: options?.onAction,
        title: titles[type],
      },
    ]);
  };

  useEffect(() => {
    if (toasts.length === 0) return;

    const toastsSemAcao = toasts.filter((t) => !t.actionLabel);

    const timers = toastsSemAcao.map((toast) =>
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [toasts]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-[9999]">
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast
              key={t.id}
              message={t.message}
              type={t.type}
              title={t.title}
              actionLabel={t.actionLabel}
              onAction={t.onAction}
              onClose={() => removeToast(t.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  }
  return context;
}
