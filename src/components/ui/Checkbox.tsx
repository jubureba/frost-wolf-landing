import { AnimatePresence, motion } from "framer-motion";

export function Checkbox({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`inline-flex items-center gap-2 cursor-pointer select-none ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <div
        className={`relative w-5 h-5 rounded-xl border-2 transition-colors flex justify-center items-center
        ${
          checked
            ? "border-lime-500 bg-lime-600"
            : "border-neutral-700 bg-neutral-900"
        }
        ${disabled ? "pointer-events-none" : "hover:border-lime-400"}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        <AnimatePresence>
          {checked && (
            <motion.svg
              key="checkmark"
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={3}
              className="w-4 h-4"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
      {label && (
        <span
          className={`text-sm font-medium ${
            disabled ? "text-gray-500" : "text-lime-400"
          }`}
        >
          {label}
        </span>
      )}
    </label>
  );
}
