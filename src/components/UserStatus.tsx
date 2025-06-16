"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { LoginGoogleButton } from "./GlowOnHoverButton";

export function UserStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setDropdownOpen(false); // fecha dropdown se mudar usuário
    });

    // Fecha dropdown se clicar fora
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
      unsubscribe();
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

  if (!user) {
    return (
      <LoginGoogleButton className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold transition" />
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`relative flex items-center gap-3 rounded-md bg-[trasparent] hover:bg-[#5100a3] px-3 py-1 text-white font-semibold transition glow-border-active ${
          dropdownOpen ? "active" : ""
        }`}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName ?? "Avatar"}
            className="w-8 h-8 rounded-full object-cover border-2 border-purple-400"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold">
            {user.displayName?.[0] ?? user.email?.[0] ?? "?"}
          </div>
        )}
        <span className="whitespace-nowrap max-w-[8rem] overflow-hidden text-ellipsis">
          {user.displayName ?? user.email ?? "Usuário"}
        </span>
        <svg
          className={`w-4 h-4 ml-1 transition-transform ${
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
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-[#1f1f1f] rounded-md shadow-lg border border-purple-700 py-2 z-50">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-600 hover:text-white transition"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
