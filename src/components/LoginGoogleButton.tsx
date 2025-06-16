"use client";

import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useState } from "react";

export function LoginGoogleButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login() {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Usuário logado:", result.user);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={login}
        disabled={loading}
        className="ml-4 px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-sm text-white transition"
      >
        {loading ? "Carregando..." : "Entrar com Google"}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </>
  );
}
