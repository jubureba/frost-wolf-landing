import { db } from "./firebase";
import { v4 as uuidv4 } from "uuid";
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

export type Usuario = {
  email: string;
  role: string; // exemplo: "RL", "USER"
  core: string; // exemplo: "Core A"
};

// Tipagem do player
export type Player = {
  nome: string;
  realm: string;
  discord?: string;
  battletag?: string;
  twitch?: string;
};

// Tipagem do core
export type Core = {
  id: string;
  nome: string;
  informacoes: string;
  dias: {
    diasSelecionados: string[];
    horaInicio: string;
    horaFim: string;
  };
  precisaDe: string;
  recrutando: boolean;
  bossAtual: string;
  linkRecrutamento?: string;
  composicaoAtual: Player[];
  ordem?: number;
};
// FUNÇÕES DO USUARIO //
// Cria ou atualiza o usuário no Firestore
export const salvarOuAtualizarUsuario = async (
  uid: string,
  data: Partial<Usuario>
) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    await updateDoc(userRef, data);
    console.log(`👤 Usuário ${uid} atualizado.`);
  } else {
    await setDoc(userRef, data);
    console.log(`🆕 Usuário ${uid} criado.`);
  }
};

export const buscarUsuario = async (uid: string): Promise<Usuario | null> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  return userSnap.data() as Usuario;
};

// FUNÇÕES DO CORE //
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
    twitch: obj.twitch ? String(obj.twitch).trim() : "", // ✅ Incluído na sanitização
  };
}

// 🔸 Buscar todos os cores
export const getCores = async (): Promise<Core[]> => {
  const coresCollection = collection(db, "cores");
  const snapshot = await getDocs(coresCollection);

  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as Omit<Core, "id">;
      return {
        id: doc.id,
        ...data,
        recrutando: data.recrutando ?? false,
      };
    })
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
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

// 🔸 Adicionar player se não existir
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

export const criarNovoCore = async (nome = "Novo Core"): Promise<Core> => {
  const id = uuidv4();

  const core: Core = {
    id,
    nome,
    informacoes: "",
    dias: {
      diasSelecionados: [],
      horaInicio: "",
      horaFim: "",
    },
    precisaDe: "Defina o recrutamento",
    recrutando: false,
    bossAtual: "",
    linkRecrutamento: "",
    composicaoAtual: [],
  };

  await setDoc(doc(db, "cores", id), core);

  console.log(`✅ Core criado com ID ${id}`);

  return core;
};
