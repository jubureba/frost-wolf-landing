type LinkButtonProps = {
  href: string;
  label: React.ReactNode; // Alterado de string para React.ReactNode
};

export function LinkButton({ href, label }: LinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 bg-[#333] hover:bg-[#444] rounded-xl px-3 py-2 text-sm text-gray-200 transition"
    >
      {label}
    </a>
  );
}
