'use client';

import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { LoginGoogleButton } from './LoginGoogleButton';

export function UserStatus() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Usuário logado:', user);
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  function handleLogout() {
    signOut(auth).catch((error) => {
      console.error('Erro ao sair:', error);
    });
  }

  if (user) {
    return (
      <div className="flex items-center gap-4 text-white">
        <span>Olá, {user.displayName ?? user.email ?? 'Usuário'}!</span>
        <button
          onClick={handleLogout}
          className="ml-4 px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-sm text-white transition"
        >
          Sair
        </button>
      </div>
    );
  }

  return <LoginGoogleButton />;
}
