"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { GlowOnHoverButton } from "./GlowButton";
import { buscarUsuario, salvarOuAtualizarUsuario } from "../../lib/firestoreService";

export function LoginGoogleButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login() {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("✅ Usuário logado:", {
        uid: user.uid,
        nome: user.displayName,
        email: user.email,
      });

      const jaRegistrado = await buscarUsuario(user.uid);

      if (!jaRegistrado) {
        // Primeiro login: registra com valores padrão
        await salvarOuAtualizarUsuario(user.uid, {
          email: user.email ?? "",
          role: "USER", // padrão
          core: "",     // será vinculado depois
        });
        console.log("🆕 Usuário criado no Firestore com role USER.");
      } else {
        console.log("👤 Usuário já registrado no Firestore.");
      }

    } catch (e) {
      console.error("Erro ao fazer login:", e);
      setError(e instanceof Error ? e.message : String(e));
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
