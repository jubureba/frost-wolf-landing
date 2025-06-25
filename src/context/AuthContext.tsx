"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  coreId: string | null;    // mantém o id interno
  coreName: string | null;  // para mostrar o nome no UI
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  coreId: null,
  coreName: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [coreId, setCoreId] = useState<string | null>(null);
  const [coreName, setCoreName] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Busca o documento do usuário
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();

          setRole(data.role ?? null);
          setCoreId(data.core ?? null);

          if (data.core) {
            // Busca o core para pegar o nome
            const coreRef = doc(db, "cores", data.core);
            const coreSnap = await getDoc(coreRef);

            if (coreSnap.exists()) {
              const coreData = coreSnap.data();
              setCoreName(coreData.nome ?? null);
            } else {
              setCoreName(null);
              console.warn("Core não encontrado para o id:", data.core);
            }
          } else {
            setCoreName(null);
          }
        } else {
          // Usuário não encontrado no Firestore
          setRole(null);
          setCoreId(null);
          setCoreName(null);
        }
      } else {
        // Usuário deslogado
        setRole(null);
        setCoreId(null);
        setCoreName(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, role, coreId, coreName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
