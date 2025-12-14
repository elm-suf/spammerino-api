import { TwitchApiSingleton } from "@/core/twitch-singleton";
import type { AppRouteHandler } from "@/lib/types";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { mapUser } from "./user.model";

import { TwitchEmotes } from "../../core/twitch-emotes.service";
import type { GetEmotesByUsernameRoute, GetUserByUsernameRoute, SearchUsersRoute } from "./users.routes";

// shared logic
const _getUserByUsername = async (userName: string) => {
    console.log(`_getUserByUsername userName:`, userName);
    if (!userName) { return null; }

    const apiClient = TwitchApiSingleton.getInstance();
    const data = await apiClient.users.getUserByName(userName);
    return mapUser(data);
};
const _getUserEmotes = async (userId: number) => {
    console.log(`_getUserEmotes userId:`, userId);
    if (!userId) { return null; }

    const service = new TwitchEmotes();
    const emotes = await service.fetchEmotes(userId);
    return emotes;
};

const _searchUsers = async (userName: string) => {
    console.log(`_searchUsers userName:`, userName);
    const apiClient = TwitchApiSingleton.getInstance();

    const data = await apiClient.search.searchChannels(userName, {
        limit: 5,
    });

    const users = await Promise.all(data.data.map(el => el.getUser()));

    return users.map(user => mapUser(user)).filter(user => user !== null).sort((a, b) => a.displayName.localeCompare(b.displayName));
};

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
        if (!user) { return null; }

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


