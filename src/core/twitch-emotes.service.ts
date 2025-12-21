import { ApiClient } from "@twurple/api";
import { AppTokenAuthProvider } from "@twurple/auth";

import env from "@/env";

import type { Emote } from "../routes/users/user.model";

import { Constants } from "./constants";

// BTTV
interface RawBttvChannelEmotesResponse {
  channelEmotes: BTTVEmote[];
}
type RawBttvGlobalEmotesResponse = BTTVEmote[];
interface BTTVEmote {
  id: string;
  code: string;
  imageType: string;
  animated: boolean;
  userId: string;
}

// 7TV
interface RawSevenTVChannelEmotesResponse {
  emote_set: {
    emotes: {
      id: string;
      name: string;
    }[];
  };
}
interface RawSevenTVGlobalEmotesResponse {
  emotes: {
    id: string;
    name: string;
  }[];
}

export class TwitchEmotes {
  apiClient: ApiClient;

  constructor() {
    if (!env.TWITCH_CLIENT_ID || !env.TWITCH_CLIENT_SECRET) {
      throw new Error("Missing Twitch credentials");
    }

    const authProvider = new AppTokenAuthProvider(
      env.TWITCH_CLIENT_ID,
      env.TWITCH_CLIENT_SECRET,
    );
    this.apiClient = new ApiClient({ authProvider });
  }

  async fetchEmotes(userId: number): Promise<Emote[]> {
    const requests = [
      this.getTwitchEmotes(userId),
      this.getBTTVEmotes(userId),
      this.getSevenTVEmotes(userId),
    ];

    const data = await Promise.all(requests).then(
      emotes => emotes.flat(),
    );
    return data;
  }

  private async getTwitchEmotes(id: number): Promise<Emote[]> {
    const channelEmotes = this.apiClient.chat.getChannelEmotes(id)
      .then(data => data.map<Emote>(emote => ({
        name: emote.name,
        link: emote.getFormattedImageUrl(),
        type: "twitchemote",
      })))
      .catch(() => new Array<Emote>());

    const globalEmotes = this.apiClient.chat.getGlobalEmotes()
      .then(data => data.map<Emote>(emote => ({
        name: emote.name,
        link: emote.getFormattedImageUrl(),
        type: "twitchemote",
      })))
      .catch(() => new Array<Emote>());

    const data = await Promise.all([channelEmotes, globalEmotes]).then(
      emotes => emotes.flat(),
    );

    return data;
  }

  private async getBTTVEmotes(id: number): Promise<Emote[]> {
    const mapBTTV = (emotes: BTTVEmote[]): Emote[] => emotes.map(e => ({
      name: e.code,
      link: Constants.BTTV.CDN(e.id, 0),
      type: "bttvemote",
    }));

    const channelEmotes = this.fetchJson<RawBttvChannelEmotesResponse>(Constants.BTTV.Channel(id))
      .then(data => data.channelEmotes)
      .then(emotes => mapBTTV(emotes))

      .catch(() => new Array<Emote>());

    const globalEmotes = this.fetchJson<RawBttvGlobalEmotesResponse>(Constants.BTTV.Global)
      .then(emotes => mapBTTV(emotes))
      .catch(() => new Array<Emote>());

    const data = await Promise.all([channelEmotes, globalEmotes]).then(
      emotes => emotes.flat(),
    );

    return data;
  }

  private async getSevenTVEmotes(id: number): Promise<Emote[]> {
    const mapSevenTV = (emotes: { id: string; name: string }[]): Emote[] => emotes.map(e => ({
      name: e.name,
      link: Constants.SevenTV.CDN(e.id, 0),
      type: "seventvemote",
    }));

    const channelEmotes = this.fetchJson<RawSevenTVChannelEmotesResponse>(Constants.SevenTV.Channel(id))
      .then(data => data.emote_set.emotes)
      .then(emotes => mapSevenTV(emotes))
      .catch(() => new Array<Emote>());

    const globalEmotes = this.fetchJson<RawSevenTVGlobalEmotesResponse>(Constants.SevenTV.Global)
      .then(data => data.emotes)
      .then(emotes => mapSevenTV(emotes))
      .catch(() => new Array<Emote>());

    const data = await Promise.all([channelEmotes, globalEmotes]).then(
      emotes => emotes.flat(),
    );

    return data;
  }

  // TODO:  handle ffz emotes

  async fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  }
}
