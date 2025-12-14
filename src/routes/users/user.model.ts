import z from "zod";


export type User = ReturnType<typeof mapUser>;

export function mapUser(data: import("@twurple/api").HelixUser | null) {
    if (!data) {
        return null;
    }
    return {
        id: data.id,
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        type: data.type,
        broadcasterType: data.broadcasterType,
        profilePictureUrl: data.profilePictureUrl,
        offlinePlaceholderUrl: data.offlinePlaceholderUrl,
        creationDate: data.creationDate,
    };
}


export const selectUsersSchema = z.object({
    id: z.string(),
    name: z.string(),
    displayName: z.string(),
    description: z.string(),
    type: z.string(),
    broadcasterType: z.string(),
    profilePictureUrl: z.string(),
    offlinePlaceholderUrl: z.string(),
    creationDate: z.string(),
})

export type Emote = {
    name: string;
    link: string;
    type: 'seventvemote' | 'ffzemote' | 'bttvemote' | 'twitchemote';
};

export const selectEmotesSchema = z.array(z.object({
    name: z.string(),
    link: z.string(),
    type: z.string(),
}))

export const selectSearchUsersSchema = z.array(selectUsersSchema)