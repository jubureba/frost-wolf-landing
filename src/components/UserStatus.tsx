"use client";

import { useRef, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { LoginGoogleButton } from "./ui/LoginGoogleButton";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";

export function UserStatus() {
  const { user, role, coreName, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      setDropdownOpen(false);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  }

  if (loading) return null;

  if (!user) {
    return <LoginGoogleButton />;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 0 8px rgb(163 230 53)",
        }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex items-center gap-3 rounded-md
          bg-transparent
          px-3 py-1
          text-lime-400 font-semibold
          border border-lime-500
          transition
          duration-200
          hover:bg-lime-500 hover:text-neutral-900
          focus:outline-none focus:ring-2 focus:ring-lime-400
          ${dropdownOpen ? "ring-2 ring-lime-400" : ""}
        `}
        style={{
          boxShadow: dropdownOpen ? "0 0 8px rgb(163 230 53)" : "none",
        }}
      >
        {user.photoURL ? (
          <Image
            src={user.photoURL!}
            alt={user.displayName ?? "Avatar"}
            width={32} // ou 24, 40, 48, conforme seu design
            height={32}
            className="w-8 h-8 rounded-full object-cover border border-lime-500"
            style={{ boxShadow: "0 0 6px rgb(163 230 53)" }}
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-white text-sm font-bold border border-lime-500"
            style={{ boxShadow: "0 0 6px rgb(163 230 53)" }}
          >
            {user.displayName?.[0] ?? user.email?.[0] ?? "?"}
          </div>
        )}
        <span
          className="whitespace-nowrap max-w-[8rem] overflow-hidden text-ellipsis"
          title={user.displayName ?? user.email ?? "Usuário"}
        >
          {user.displayName ?? user.email ?? "Usuário"}
        </span>
        <svg
          className={`w-4 h-4 ml-1 transition-transform text-lime-400 ${
            dropdownOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </motion.button>

      {dropdownOpen && (
        <div
          className="absolute right-0 mt-2 w-44 rounded-md shadow-lg py-2 z-50
            bg-transparent backdrop-blur-sm text-sm"
        >
          <div className="px-5 py-1 text-lime-400">
            <p className="font-semibold">Função: {role ?? "?"}</p>
            <p className="font-semibold">Core: {coreName ?? "?"}</p>
          </div>
          <hr className="my-1 border-lime-500" />
          <button
            onClick={handleLogout}
            className="w-full text-left px-5 py-2.5 text-red-500 font-semibold border border-red-500 rounded-xl bg-transparent transition duration-300 ease-in-out shadow-none hover:bg-red-600 hover:text-white hover:shadow-[0_0_10px_3px_rgba(220,38,38,0.9)] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
