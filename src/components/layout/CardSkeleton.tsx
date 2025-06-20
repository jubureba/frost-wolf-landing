import React from "react";

interface CardSkeletonProps {
  variant?: "card" | "table";  // define o tipo de skeleton (padrão: card)
  avatarSize?: number;         // tamanho do círculo do avatar em px (para card)
  lines?: number;              // quantas linhas de texto
  widths?: (number | string)[]; // larguras das linhas (px ou %)
  className?: string;          // classes extras no container
}

export function CardSkeleton({
  variant = "card",
  avatarSize = 64,
  lines = 2,
  widths,
  className = "",
}: CardSkeletonProps) {
  // Larguras padrão das linhas se não passar:
  const defaultWidths = ["80%", "60%"];
  const linesWidths = widths ?? defaultWidths;

  if (variant === "table") {
    // Skeleton para linhas de tabela: retângulos horizontais
    return (
      <>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-5 shimmer rounded mb-3 last:mb-0 ${className}`}
            style={{
              width: linesWidths[i] || "100%",
              maxWidth: "100%",
            }}
          />
        ))}
      </>
    );
  }

  // Skeleton para card com avatar + linhas
  return (
    <div
      className={`flex flex-col items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-xl p-3 w-28 ${className}`}
      style={{ width: avatarSize + 24 }} // largura total aproximada para o card
    >
      <div
        className="rounded-full shimmer"
        style={{ width: avatarSize, height: avatarSize }}
      />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 shimmer rounded"
          style={{
            width: linesWidths[i] || "60%",
            maxWidth: "100%",
          }}
        />
      ))}
    </div>
  );
}
