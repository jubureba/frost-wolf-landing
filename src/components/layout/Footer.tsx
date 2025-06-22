"use client";

export function Footer() {
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE || "Data desconhecida";
  const version = process.env.NEXT_PUBLIC_VERSION || "0.0.0";
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || "Desenvolvimento";
  const commit = process.env.NEXT_PUBLIC_COMMIT;

  return (
    <footer className="text-xs text-neutral-500 text-center border-t border-neutral-800 pt-4">
      <div>
        Desenvolvido por{" "}
        <a
          href="https://www.linkedin.com/in/jubureba/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-lime-400 transition-colors"
        >
          Anderson Lima
        </a>
      </div>
      <div>
        Versão {version} • Build {buildDate} • Ambiente {environment} • Commit: {commit}
      </div>
      <div></div>
    </footer>
  );
}
