"use client";

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
  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
    warning: "bg-yellow-600 text-black",
  };

  return (
    <div
      className={`flex flex-col gap-1 rounded-lg px-4 py-3 shadow-lg ${colors[type]}`}
    >
      {title && <strong className="text-sm">{title}</strong>}
      <span>{message}</span>

      <div className="flex gap-3 justify-end">
        {actionLabel && (
          <button
            onClick={() => {
              onAction?.();
              onClose();
            }}
            className="underline font-semibold"
          >
            {actionLabel}
          </button>
        )}
        <button onClick={onClose} className="font-bold">
          ✕
        </button>
      </div>
    </div>
  );
}
