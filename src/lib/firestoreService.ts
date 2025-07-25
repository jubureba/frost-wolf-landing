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

export type Especializacao = {
  id: string;  // use string para não ter conflito com o state que usa string
  name: string;
  role: "tank" | "healer" | "dps";
  icon: string;
  href: string;
};

export type Player = {
  nome: string;
  realm: string;
  discord?: string;
  battletag?: string;
  twitch?: string;
  classe?: string;
  especializacao?: string;
  funcao?: string;
  especializacoesDisponiveis?: Especializacao[]; // <-- torne opcional aqui
};

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

// FUNÇÕES DO USUÁRIO
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

// SANITIZAÇÃO: remove especializacoesDisponiveis antes de salvar no Firestore
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
    twitch: obj.twitch ? String(obj.twitch).trim() : "",
    classe: obj.classe ? String(obj.classe).trim() : undefined,
    especializacao: obj.especializacao ? String(obj.especializacao).trim() : undefined,
    funcao: obj.funcao ? String(obj.funcao).trim() : undefined,
    // REMOVE especializacoesDisponiveis para NÃO salvar no Firestore
  };
}

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

export const updateCoreField = async (
  coreId: string,
  data: Partial<Omit<Core, "id">>
) => {
  const coreRef = doc(db, "cores", coreId);
  const coreSnap = await getDoc(coreRef);

  // Sanitiza composicaoAtual para remover campos indesejados
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

export const saveCore = async (core: Core) => {
  const coreSanitizado: Core = {
    ...core,
    composicaoAtual: core.composicaoAtual.map(sanitizePlayer),
  };
  await setDoc(doc(db, "cores", core.id), coreSanitizado);
};

export const deleteCore = async (nome: string) => {
  await deleteDoc(doc(db, "cores", nome));
};

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

export const buscarEspecializacaoPorNome = async (
  nome: string
): Promise<Especializacao | null> => {
  const snapshot = await getDocs(
    collection(db, "especializacoes")
  );

  for (const docSnap of snapshot.docs) {
    const espec = docSnap.data() as Especializacao;
    if (espec.name.toLowerCase() === nome.toLowerCase()) {
      return espec;
    }
  }

  return null;
};