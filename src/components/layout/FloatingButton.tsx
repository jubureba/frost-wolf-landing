import { motion } from "framer-motion";

interface FloatingButtonProps {
  children: React.ReactNode;
  action: () => Promise<void>;
  tooltip?: string;
  disabled?: boolean;
}

export function FloatingButton({
  children,
  action,
  tooltip = "Criar novo Core",
  disabled = false,
}: FloatingButtonProps) {
  return (
    <form action={action}>
      <motion.button
        type="submit"
        whileHover={disabled ? undefined : {
          scale: 1.08,
          boxShadow: "0 0 12px rgb(168 85 247)", // Roxo
        }}
        whileTap={disabled ? undefined : { scale: 0.95 }}
        title={tooltip}
        disabled={disabled} // passa disabled para o botão
        className={`fixed bottom-6 right-6 z-50
          inline-flex items-center justify-center
          rounded-full border border-purple-500
          bg-neutral-900 text-purple-400
          transition-colors duration-200
          w-14 h-14 text-2xl shadow-md select-none
          ${disabled
            ? "opacity-50 cursor-not-allowed hover:bg-neutral-900 hover:text-purple-400"
            : "hover:bg-purple-500 hover:text-neutral-900"
          }`}
      >
        {children}
      </motion.button>
    </form>
  );
}
