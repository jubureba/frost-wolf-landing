interface FloatingButtonProps {
  children: React.ReactNode;
  action: () => Promise<void>;
}

export function FloatingButton({ children, action }: FloatingButtonProps) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full w-14 h-14 text-3xl shadow-lg"
        title="Criar novo Core"
      >
        {children}
      </button>
    </form>
  );
}
