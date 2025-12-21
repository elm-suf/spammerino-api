import { ApiClient } from "@twurple/api";
import { AppTokenAuthProvider } from "@twurple/auth";

import env from "@/env";

import type { Badge, Emote } from "../routes/users/user.model";

import { Constants } from "./constants";
import { TwitchApiSingleton } from "./twitch-singleton";

// BTTV
interface RawBttvChannelEmotesResponse {
  channelEmotes: BTTVEmote[];
  sharedEmotes: BTTVEmote[];
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
  apiClient = TwitchApiSingleton.getInstance();

  async fetchBadges(userId: number): Promise<Badge[]> {
    const channelBadges = this.apiClient.chat.getChannelBadges(userId)
      .then((data) => {
        return data.map((badgeSet) => {
          const mapped = badgeSet.versions.map<Badge>(version => ({
            name: `${badgeSet.id}/${version.id}`,
            link: version.getImageUrl(1) ?? "",
          }));

          return mapped;
        }).flat();
      })
      .catch(() => new Array<Badge>());

    const globalBadges = this.apiClient.chat.getGlobalBadges()
      .then((data) => {
        return data.map((badgeSet) => {
          const mapped = badgeSet.versions.map<Badge>(version => ({
            name: `${badgeSet.id}/${version.id}`,
            link: version.getImageUrl(1) ?? "",
          }));

          return mapped;
        }).flat();
      })
      .catch(() => new Array<Badge>());

    return Promise.all([channelBadges, globalBadges]).then(
      badges => badges.flat(),
    );
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
      .then(data => [...data.channelEmotes, ...data.sharedEmotes])
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
      link: Constants.SevenTV.CDN(e.id, 1),
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
