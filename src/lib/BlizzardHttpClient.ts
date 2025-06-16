import axios, { AxiosRequestConfig } from "axios";

export class BlizzardHttpClient {
  private token: string | null = null;
  private tokenExpiration: number = 0;

  constructor(
    private clientId: string,
    private clientSecret: string,
    public readonly region: string = "us"
  ) {}
  
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
    return this.token ?? '';
  }

  async get<T>(
    url: string,
    params?: Record<string, string | number | boolean | undefined>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const token = await this.authenticate();

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
  }
}
