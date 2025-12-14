import { ApiClient } from "@twurple/api";
import { AppTokenAuthProvider } from "@twurple/auth";
import env from "@/env";
export class TwitchApiSingleton {
  private static instance: ApiClient;

  private constructor() {} // Private constructor to prevent instantiation

  static getInstance(): ApiClient {
    if (!TwitchApiSingleton.instance) {
      const clientId = env.TWITCH_CLIENT_ID
      const clientSecret = env.TWITCH_CLIENT_SECRET;

      const authProvider = new AppTokenAuthProvider(clientId, clientSecret);
      TwitchApiSingleton.instance = new ApiClient({ authProvider });
    }
    return TwitchApiSingleton.instance;
  }
}