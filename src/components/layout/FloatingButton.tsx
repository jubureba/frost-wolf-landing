import { motion } from "framer-motion";

interface FloatingButtonProps {
  children: React.ReactNode;
  action: () => Promise<void>;
  tooltip?: string;
}

export function FloatingButton({
  children,
  action,
  tooltip = "Criar novo Core",
}: FloatingButtonProps) {
  return (
    <form action={action}>
      <motion.button
        type="submit"
        whileHover={{
          scale: 1.08,
          boxShadow: "0 0 12px rgb(168 85 247)", // Roxo
        }}
        whileTap={{ scale: 0.95 }}
        title={tooltip}
        className="fixed bottom-6 right-6 z-50
          inline-flex items-center justify-center
          rounded-full border border-purple-500
          bg-neutral-900 text-purple-400
          hover:bg-purple-500 hover:text-neutral-900
          transition-colors duration-200
          w-14 h-14 text-2xl shadow-md select-none"
      >
        {children}
      </motion.button>
    </form>
  );
}
