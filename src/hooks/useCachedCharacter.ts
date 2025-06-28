const CACHE_EXPIRATION_MS = 6 * 60 * 60 * 1000;

type CharacterData = Record<string, unknown>;

export function getCachedCharacter(
  realm: string,
  name: string
): CharacterData | null {
  const key = `char-${realm.toLowerCase()}-${name.toLowerCase()}`;
  const item = localStorage.getItem(key);
  if (!item) return null;
  try {
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_EXPIRATION_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function setCachedCharacter(
  realm: string,
  name: string,
  data: CharacterData
) {
  const key = `char-${realm.toLowerCase()}-${name.toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
}
