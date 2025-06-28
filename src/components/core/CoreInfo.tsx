export function CoreInfo({
  label,
  value,
  loading,
  compact,
}: {
  label: React.ReactNode;
  value?: string;
  loading?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col ${compact ? "min-w-[140px]" : "gap-1"}`}>
      <span
        className={`font-semibold text-lime-400 select-none font-saira ${
          compact ? "text-sm" : ""
        }`}
      >
        {label}
      </span>
      {loading ? (
        <div
          className={`${compact ? "h-4 w-24" : "h-5 w-32"} shimmer rounded`}
        />
      ) : (
        <span
          className={`text-gray-400 font-medium font-saira ${
            compact ? "text-sm break-words" : ""
          }`}
        >
          {value || "-"}
        </span>
      )}
    </div>
  );
}
