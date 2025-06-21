"use client";

import { motion } from "framer-motion";
import React from "react";

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

export function InputField({
  label,
  value,
  onChange,
  required,
  disabled,
  placeholder,
}: InputFieldProps) {
  const hasValue = value.length > 0;

  return (
    <div className="relative">
      <input
        className={`
          w-full rounded-xl border border-neutral-600 bg-neutral-950 px-4 py-3 text-sm
          focus:ring-2 focus:ring-lime-500 focus:outline-none transition
          disabled:opacity-60
        `}
        value={value}
        onChange={onChange}
        placeholder={hasValue ? "" : placeholder || ""}
        required={required}
        disabled={disabled}
      />
      <motion.label
        initial={false}
        animate={{
          y: hasValue ? -22 : 0,
          x: 4,
          scale: hasValue ? 0.85 : 1,
          color: hasValue ? "#a3e635" : "#9ca3af", // Lime quando preenchido, cinza quando vazio
        }}
        className="absolute top-3 left-3 pointer-events-none text-sm origin-left transition-all"
      >
        {label}
      </motion.label>
    </div>
  );
}
