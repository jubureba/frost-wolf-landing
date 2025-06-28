export function Filters() {
  return (
    <div className="flex gap-6 mb-6 border-b border-[#2a2a2a]">
      <button className="pb-2 border-b-2 border-lime-500 text-lime-400 font-semibold transition-colors duration-200">
        Cores
      </button>
      <button className="pb-2 text-gray-400 hover:text-lime-400 hover:border-b-2 hover:border-lime-500 transition-colors duration-200">
        ...
      </button>
    </div>
  );
}
