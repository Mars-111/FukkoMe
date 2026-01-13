


export type MemberFields = {
    roleId: number;
}

export type ChatMembers = {
    chatId: number;
    members?: {
        value: Map<number, MemberFields>;
        syncAfterJoiningChat: boolean;
        lastSync?: number;
    };
};


// count?: {
//     value: number;
//     syncAfterJoiningChat: boolean;
//     lastSync?: number;
// };


// export function objectToChatMembers(obj: any, chatId: number, syncWhenYouMemberInChat?: boolean) {
//     if (!obj.count) {
//         throw new Error("count - is reqired field forChatMembers");
//     }
//     const chatMembers: ChatMembers = { count: obj.count, chatId: chatId, syncAfterJoiningChat: syncWhenYouMemberInChat || false };
//     if (obj.membersIds || obj.members_ids) {
//         chatMembers.membersIds = obj.membersIds || obj.members_ids;
//     }
//     return chatMembers;
// } 