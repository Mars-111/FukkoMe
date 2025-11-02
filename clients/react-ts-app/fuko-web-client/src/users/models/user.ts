

export type User = {
    id: number;
    username: string;
    version: number;
    smallAvatarId: number | null;
    largeAvatarId: number | null;
    fullscreenAvatarId: number | null;
    createdAt?: number;
}

export const debugUserFiedls = (user: User) => {
    return `[id]: ${user.id} [username]: ${user.username} [version]: ${user.version} [smallAvatarId]: ${user.smallAvatarId} [largeAvatarId]: ${user.largeAvatarId} [fullscreenAvatarId]: ${user.fullscreenAvatarId} [createdAt]: ${user.createdAt}`;
}