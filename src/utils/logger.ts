const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

const sendLog = async (level: 'info' | 'error', mensagem: string, dados?: unknown) => {
  try {
    await fetch(`${getBaseUrl()}/api/log`, {
      method: 'POST',
      body: JSON.stringify({ level, mensagem, dados }),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`Falha ao enviar log ${level.toUpperCase()}`, { mensagem, dados, error });
  }
};

export const logInfo = (mensagem: string, dados?: unknown) => sendLog('info', mensagem, dados);
export const logError = (mensagem: string, dados?: unknown) => sendLog('error', mensagem, dados);
