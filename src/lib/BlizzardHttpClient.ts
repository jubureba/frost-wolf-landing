import axios, { AxiosRequestConfig } from "axios";
import { redis } from "./redis";
import { BlizzardApiError } from "@/utils/BlizzardApiError";

export class BlizzardHttpClient {
  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    public readonly region: string = "us"
  ) {}

  /* -------------------------------------------------------------------------- */
  /*  OAuth – token com cache Upstash                                            */
  /* -------------------------------------------------------------------------- */
  private async authenticate(): Promise<string> {
    const fromCache = await redis.get<string>("blizzard:token");
    if (fromCache) return fromCache; // token ainda válido

    const { data } = await axios.post(
      `https://${this.region}.battle.net/oauth/token`,
      "grant_type=client_credentials",
      { auth: { username: this.clientId, password: this.clientSecret } }
    );

    // Salva no Redis com TTL (–60 s de folga)
    const ttl = data.expires_in - 60;
    await redis.set("blizzard:token", data.access_token, { ex: ttl });

    return data.access_token;
  }

  /* -------------------------------------------------------------------------- */
  /*  Retry simples p/ erros transitórios                                        */
  /* -------------------------------------------------------------------------- */
  private async requestWithRetry<T, P extends Record<string, unknown>>(
    url: string,
    params: P,
    config: AxiosRequestConfig | undefined,
    retries = 2
  ): Promise<T> {
    const token = await this.authenticate();

    for (let i = 0; ; i++) {
      try {
        const { data } = await axios.get<T>(url, {
          ...config,
          headers: {
            Authorization: `Bearer ${token}`,
            ...(config?.headers ?? {}),
          },
          params: { locale: "pt_BR", ...params },
        });
        return data;
      } catch (err) {
        const status = axios.isAxiosError(err) ? err.response?.status ?? 500 : 500;

        // 429 / 5xx → tenta novamente
        if (i < retries && [429, 500, 502, 503, 504].includes(status)) {
          await new Promise((r) => setTimeout(r, 250 * (i + 1)));
          continue;
        }

        const msg =
          axios.isAxiosError(err)
            ? err.response?.data?.detail || err.message
            : "Erro inesperado";
        throw new BlizzardApiError(msg, status);
      }
    }
  }

  /* -------------------------------------------------------------------------- */
  /*  GET com cache por URL + params                                             */
  /* -------------------------------------------------------------------------- */
  async get<T>(
    url: string,
    params: Record<string, string | number | boolean | undefined> = {},
    config?: AxiosRequestConfig
  ): Promise<T> {
    const key = `blizzard:res:${url}:${JSON.stringify(params)}`;
    const cached = await redis.get<T>(key);
    if (cached) return cached;

    const data = await this.requestWithRetry<T, typeof params>(url, params, config);

    /* TTL adaptativo:
       - endpoints "static-*" mudam raramente → 24 h
       - demais → 5 min                                                 */
    const isStatic = String(params.namespace).startsWith("static-");
    await redis.set(key, data, { ex: isStatic ? 86400 : 300 });

    return data;
  }
}
