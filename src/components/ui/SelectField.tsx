"use client";

import { motion } from "framer-motion";
import React from "react";

type Option = {
  id: string;
  name: string;
  role: "tank" | "healer" | "dps";
};

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
};

export function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
  required,
  placeholder,
}: SelectFieldProps) {
  const hasValue = value.length > 0;

  return (
    <div className="relative">
      <select
        className={`
          w-full rounded-xl border border-neutral-600 bg-neutral-950 px-4 py-3 text-sm text-white
          focus:ring-2 focus:ring-lime-500 focus:outline-none transition
          disabled:opacity-60
        `}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
      >
        <option value="" disabled>
          {placeholder || `Selecione ${label.toLowerCase()}`}
        </option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
      <motion.label
        initial={false}
        animate={{
          y: hasValue ? -22 : 0,
          x: 12,
          scale: hasValue ? 0.85 : 1,
          color: hasValue ? "#a3e635" : "#9ca3af", // verde lime ou cinza
        }}
        className="absolute top-3 left-3 pointer-events-none text-sm origin-left transition-all"
      >
        {label}
      </motion.label>
    </div>
  );
}
