import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

// Tipagem do player
export type Player = {
  nome: string;
  realm: string;
  discord?: string;
  battletag?: string;
};

// Tipagem do core
export type Core = {
  id: string;
  nome: string;
  informacoes: string;
  dias: string;
  precisaDe: string;
  bossAtual: string;
  composicaoAtual: Player[];
};

// 🔧 Função utilitária segura
export function sanitizePlayer(player: unknown): Player {
  if (typeof player !== "object" || player === null) {
    throw new Error("Player inválido");
  }

  const obj = player as Record<string, unknown>;

  return {
    nome: String(obj.nome ?? "").trim(),
    realm: String(obj.realm ?? "").trim(),
    discord: obj.discord ? String(obj.discord).trim() : "",
    battletag: obj.battletag ? String(obj.battletag).trim() : "",
  };
}

// 🔸 Buscar todos os cores
export const getCores = async (): Promise<Core[]> => {
  const coresCollection = collection(db, "cores");
  const snapshot = await getDocs(coresCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Core, "id">),
  }));
};

// 🔸 Atualizar dados de um core
export const updateCoreField = async (
  coreId: string,
  data: Partial<Omit<Core, "id">>
) => {
  const coreRef = doc(db, "cores", coreId);
  const coreSnap = await getDoc(coreRef);

  const dataSanitizado = {
    ...data,
    composicaoAtual: data.composicaoAtual?.map(sanitizePlayer),
  };

  if (coreSnap.exists()) {
    await updateDoc(coreRef, dataSanitizado);
    console.log(`Core ${coreId} atualizado com sucesso.`);
  } else {
    await setDoc(coreRef, { ...dataSanitizado, id: coreId });
    console.log(`Core ${coreId} criado com sucesso.`);
  }
};

// 🔸 Salvar um core inteiro
export const saveCore = async (core: Core) => {
  const coreSanitizado: Core = {
    ...core,
    composicaoAtual: core.composicaoAtual.map(sanitizePlayer),
  };
  await setDoc(doc(db, "cores", core.id), coreSanitizado);
};

// 🔸 Deletar um core
export const deleteCore = async (nome: string) => {
  await deleteDoc(doc(db, "cores", nome));
};

// 🔸 Adicionar player no core
export const addPlayerToCore = async (coreId: string, player: Player) => {
  const playerSanitizado = sanitizePlayer(player);

  const coreRef = doc(db, "cores", coreId);
  const coreSnap = await getDoc(coreRef);

  if (!coreSnap.exists()) {
    throw new Error(`Core ${coreId} não encontrado.`);
  }

  await updateDoc(coreRef, {
    composicaoAtual: arrayUnion(playerSanitizado),
  });
};

export const addPlayerIfNotExists = async (coreId: string, player: Player) => {
  const coreRef = doc(db, "cores", coreId);
  const coreSnap = await getDoc(coreRef);

  if (!coreSnap.exists()) {
    throw new Error(`Core ${coreId} não encontrado.`);
  }

  const coreData = coreSnap.data() as Core;
  const exists = coreData.composicaoAtual.some(
    (p) => p.nome === player.nome && p.realm === player.realm
  );

  if (exists) {
    console.log("Jogador já está no core.");
    return;
  }

  await updateDoc(coreRef, {
    composicaoAtual: arrayUnion(sanitizePlayer(player)),
  });
};

// 🔸 Remover player do core
export const removePlayerFromCore = async (coreId: string, player: Player) => {
  const playerSanitizado = sanitizePlayer(player);

  const coreRef = doc(db, "cores", coreId);
  const coreSnap = await getDoc(coreRef);

  if (!coreSnap.exists()) {
    throw new Error(`Core ${coreId} não encontrado.`);
  }

  await updateDoc(coreRef, {
    composicaoAtual: arrayRemove(playerSanitizado),
  });
};

// 🔸 Buscar dados do personagem via API interna
export async function buscarDadosPersonagem(nome: string, realm: string) {
  const res = await fetch(`/api/personagem?nome=${nome}&realm=${realm}`);
  if (!res.ok) {
    throw new Error("Erro ao buscar personagem");
  }
  return res.json();
}
