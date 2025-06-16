"use client";

import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { GlowOnHoverButton } from "./GlowButton";

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
      <GlowOnHoverButton onClick={login} disabled={loading} loading={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </GlowOnHoverButton>
      {error && (
        <p className="text-red-500 text-sm mt-2">
          Erro ao fazer login: {error}
        </p>
      )}
    </>
  );
}
