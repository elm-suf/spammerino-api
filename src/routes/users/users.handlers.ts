import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import { TwitchApiSingleton } from "@/core/twitch-singleton";

import type { GetBadgesByUsernameRoute, GetEmotesByUsernameRoute, GetUserByUsernameRoute, SearchUsersRoute } from "./users.routes";

import { TwitchEmotes } from "../../core/twitch-emotes.service";
import { mapUser } from "./user.model";

// shared logic
async function _getUserByUsername(userName: string) {
  if (!userName) {
    return null;
  }

  const apiClient = TwitchApiSingleton.getInstance();
  const data = await apiClient.users.getUserByName(userName);
  return mapUser(data);
};
async function _getUserEmotes(userId: number) {
  if (!userId) {
    return null;
  }

  const service = new TwitchEmotes();
  const emotes = await service.fetchEmotes(userId);
  return emotes;
};

async function _searchUsers(userName: string) {
  const apiClient = TwitchApiSingleton.getInstance();

  const data = await apiClient.search.searchChannels(userName, {
    limit: 5,
  });

  const users = await Promise.all(data.data.map(el => el.getUser()));

  return users.map(user => mapUser(user)).filter(user => user !== null).sort((a, b) => a.displayName.localeCompare(b.displayName));
};

async function _getUserBadges(userId: number) {
  if (!userId) {
    return null;
  }
  const service = new TwitchEmotes();
  const badges = await service.fetchBadges(userId);
  return badges;
}

export const getUserByUsername: AppRouteHandler<GetUserByUsernameRoute> = async (c) => {
  const { userName } = c.req.valid("param");
  const user = await _getUserByUsername(userName);
  if (!user) {
    return c.json(
      {
        message: `User "${userName}" not found`,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }
  return c.json(user, HttpStatusCodes.OK);
};

export const getEmotesByUsername: AppRouteHandler<GetEmotesByUsernameRoute> = async (c) => {
  const { userName } = c.req.valid("param");

  const getUserEmotesByUsername = async (userName: string) => {
    // call getOne to get userId
    const user = await _getUserByUsername(userName);
    if (!user) {
      return null;
    }

    const emotes = await _getUserEmotes(+user.id);
    return emotes;
  };

  const emotes = await getUserEmotesByUsername(userName);
  if (!emotes) {
    return c.json(
      {
        message: `User "${userName}" not found`,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }
  return c.json(emotes, HttpStatusCodes.OK);
};

export const searchUsers: AppRouteHandler<SearchUsersRoute> = async (c) => {
  const { userName } = c.req.valid("param");
  const data = await _searchUsers(userName);

  if (!data) {
    return c.json(
      {
        message: `Users "${userName}" not found`,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(data, HttpStatusCodes.OK);
};

export const getBadgesByUsername: AppRouteHandler<GetBadgesByUsernameRoute> = async (c) => {
  const { userName } = c.req.valid("param");

  const getUserBadgesByUsername = async (userName: string) => {
    // call getOne to get userId
    const user = await _getUserByUsername(userName);
    if (!user) {
      return null;
    }

    const badges = await _getUserBadges(+user.id);
    return badges;
  };

  const badges = await getUserBadgesByUsername(userName);
  if (!badges) {
    return c.json(
      {
        message: `User "${userName}" not found`,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }
  return c.json(badges, HttpStatusCodes.OK);
};
