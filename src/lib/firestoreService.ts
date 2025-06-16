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

export type Player = {
  nome: string;
  realm: string;
};

export type Core = {
  id: string;
  nome: string;
  informacoes: string;
  dias: string;
  precisaDe: string;
  bossAtual: string;
  composicaoAtual: Player[];
};

export const getCores = async (): Promise<Core[]> => {
  const coresCollection = collection(db, "cores");
  const snapshot = await getDocs(coresCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Core, "id">),
  }));
};

export const updateCoreField = async (
  coreId: string,
  data: Partial<Omit<Core, "id">>
) => {
  const coreRef = doc(db, "cores", coreId);
  const coreSnap = await getDoc(coreRef);

  if (coreSnap.exists()) {
    await updateDoc(coreRef, data);
    console.log(`Core ${coreId} atualizado com sucesso.`);
  } else {
    await setDoc(coreRef, { ...data, id: coreId });
    console.log(`Core ${coreId} criado com sucesso.`);
  }
};

/* exemplo de uso 
await updateCoreField("Core Nazgrim", {
  precisaDe: "Tank, DPS",
}); 

await updateCoreField("Core Nazgrim", {
  bossAtual: "The Lich King Mythic",
  dias: "Terças e Quintas às 20:00",
});

await updateCoreField("Core Frostwolf", {
  nome: "Core Frostwolf",
  bossAtual: "Sarkareth Heroic",
  dias: "Quartas e Domingos às 21:00",
  informacoes: "Core focado em progresso Heroic",
  precisaDe: "Healers e DPS",
  composicaoAtual: [],
});

*/


export const saveCore = async (core: Core) => {
  await setDoc(doc(db, "cores", core.nome), core);
};

export const deleteCore = async (nome: string) => {
  await deleteDoc(doc(db, "cores", nome));
};

export const addPlayerToCore = async (coreId: string, player: Player) => {
  console.log("Buscando core com id:", coreId);
  const coreRef = doc(db, "cores", coreId);
  const coreSnap = await getDoc(coreRef);

  if (!coreSnap.exists()) {
    throw new Error(`Core ${coreId} não encontrado.`);
  }

  await updateDoc(coreRef, {
    composicaoAtual: arrayUnion(player),
  });
};

export const removePlayerFromCore = async (coreId: string, player: Player) => {
  const coreRef = doc(db, "cores", coreId);
  const coreSnap = await getDoc(coreRef);

  if (!coreSnap.exists()) {
    throw new Error(`Core ${coreId} não encontrado.`);
  }

  await updateDoc(coreRef, {
    composicaoAtual: arrayRemove(player),
  });
};

export async function buscarDadosPersonagem(nome: string, realm: string) {
  const res = await fetch(`/api/personagem?nome=${nome}&realm=${realm}`);
  if (!res.ok) {
    throw new Error("Erro ao buscar personagem");
  }
  return res.json();
}
