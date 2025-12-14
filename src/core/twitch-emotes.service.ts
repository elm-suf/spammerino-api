import TwitchEmoticons from '@mkody/twitch-emoticons';
import env from '@/env';
export type Emote = {
  name: string;
  link: string;
  type: 'seventvemote' | 'ffzemote' | 'bttvemote' | 'twitchemote';
};
export class TwitchEmotes {
  fetcher: TwitchEmoticons.EmoteFetcher;
  emoteParser: TwitchEmoticons.EmoteParser;

  constructor() {
    const { EmoteFetcher, EmoteParser } = TwitchEmoticons;
    const clientId = env['TWITCH_CLIENT_ID'];
    const clientSecret = env['TWITCH_CLIENT_SECRET'];
    this.fetcher = new EmoteFetcher(clientId, clientSecret);
    this.emoteParser = new EmoteParser(this.fetcher, {
      // Custom HTML format
      template: '<img class="emote" alt="{name}" src="{link}">',
      // Match without :colons:
      match: /(\w+)+?/g,
    });
  }

  parse(text: string, size?: number): string {
    return this.emoteParser.parse(text, size);
  }

  async fetchEmotes(channelId: number) {
    const emoteCollections = await Promise.all([
      // global emotes
      this.fetcher.fetchTwitchEmotes(),
      this.fetcher.fetchBTTVEmotes(),
      this.fetcher.fetchSevenTVEmotes(),
      this.fetcher.fetchFFZEmotes(),
      // channel emotes
      this.fetcher.fetchTwitchEmotes(channelId),
      this.fetcher.fetchBTTVEmotes(channelId),
      this.fetcher.fetchSevenTVEmotes(channelId),
      this.fetcher.fetchFFZEmotes(channelId),
    ]);

    const emotesResponse = emoteCollections.flatMap(
      (collection) => new Array(...collection.entries())
    );

    const emotes = emotesResponse.map<Emote>(([key, value]) => ({
      name: key,
      link: value.toLink(1),
      type: value.constructor.name.toLowerCase() as Emote['type'],
    }));

    return emotes;
  }
}
