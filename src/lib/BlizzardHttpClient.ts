import { BlizzardApiError } from "@/utils/BlizzardApiError";
import axios, { AxiosRequestConfig } from "axios";
import { Redis } from "@upstash/redis";

export class BlizzardHttpClient {
  private token: string | null = null;
  private tokenExpiration: number = 0;
  private redis: Redis;

  constructor(
    private clientId: string,
    private clientSecret: string,
    public readonly region: string = "us"
  ) {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  private async authenticate(): Promise<string> {
    const now = Date.now();
    if (this.token && now < this.tokenExpiration) return this.token;

    const res = await axios.post(
      `https://${this.region}.battle.net/oauth/token`,
      "grant_type=client_credentials",
      {
        auth: {
          username: this.clientId,
          password: this.clientSecret,
        },
      }
    );

    this.token = res.data.access_token;
    this.tokenExpiration = now + res.data.expires_in * 1000 - 60000;

    // Cache do token (opcional)
    await this.redis.set("blizzard_token", this.token, {
      ex: res.data.expires_in - 60, // buffer de segurança
    });

    return this.token ?? "";
  }

  private sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async requestWithRetry<T, P extends Record<string, unknown>>(
    url: string,
    params?: P,
    config?: AxiosRequestConfig,
    retries = 3
  ): Promise<T> {
    const token = await this.authenticate();

    for (let i = 0; i <= retries; i++) {
      try {
        const response = await axios.get<T>(url, {
          ...config,
          headers: {
            Authorization: `Bearer ${token}`,
            ...(config?.headers || {}),
          },
          params: {
            locale: "pt_BR",
            ...(params || {}),
          },
        });

        return response.data;
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status ?? 500;
          const message = error.response?.data?.detail || error.message;
          throw new BlizzardApiError(message, status);
        }

        throw new BlizzardApiError("Erro inesperado", 500);
      }
    }

    throw new BlizzardApiError("Falha após múltiplas tentativas", 429);
  }

  async get<T>(
    url: string,
    params?: Record<string, string | number | boolean | undefined>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const cacheKey = `blizzard:${url}:${JSON.stringify(params)}`;
    const cached = await this.redis.get<T>(cacheKey);


    if (cached) {
      return cached;
    }

    const data = await this.requestWithRetry<T, Record<string, string | number | boolean | undefined>>(url, params, config);
    await this.redis.set(cacheKey, data, { ex: 300 }); // TTL: 5 minutos

    return data;
  }
}
