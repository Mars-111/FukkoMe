import { useChatById } from "../hooks/useChatById";
import type { Chat } from "../models/chat";
import { useIdentity } from "../../auth/hooks/useIdentity";
import { useMessengerLayoutStore } from "../../layout/messengerLayoutStore";
import { ChatSettings } from "./ChatSettings";
import { LargeChatAvatar } from "../../users/components/Avatar";

import styles from './ChatInfo.module.css';
import { useChatMembers } from "../hooks/useChatMembers";
import type { MemberFields } from "../models/chatMembers";
import { UserAndHisRoleCell } from "../../general/components/EntitiesCells";
import { useChatCacheMetaStore } from "../hooks/useChatCacheMetaStore";
import { useCallback } from "react";
import { exitChat, joinToChat } from "../utils/ChatUtils";
import { useNavigate } from "react-router-dom";



export function ChatInfo({chatId}: {chatId: number}) {
    const chat = useChatById(chatId);
    const members = useChatMembers(chatId);


    return (
        <div>
            {chat === null && <div>Chat not found</div>}
            {chat === undefined && <div>Loading...</div>}
            {chat && <Info chat={chat} members={members}/>}
        </div>
    );
}

function Info({ chat, members }: { chat: Chat, members?: Map<number, MemberFields> | "not found" | "start state" }) {
    const { myUserId } = useIdentity();
    const addRightNode = useMessengerLayoutStore(state => state.rightPanel.addTabNode); 
    const myChatIds = useChatCacheMetaStore((state) => state.myChatIds);
    const { accessToken } = useIdentity();
    const navigate = useNavigate();

    const onClickJoin = useCallback(() => {
        if (accessToken) {
            joinToChat(chat.id, accessToken).then((success) => {
                if (success) {
                    navigate("/app/chat/" + chat.id);
                }
                else {
                    console.error("Ошибка при попытки входа в чат. Повторите попытку или попробуйте позже");
                }
            }).catch(() => {
                console.error("Ошибка при попытки входа в чат. Повторите попытку или попробуйте позже");
            })
        }
        else {
            console.error("Токен авторизации (access token) === undefied!");
            //TODO: вывести на экран
        }
    }, [accessToken, navigate, chat]);

    const onClickExit = useCallback(() => {
        if (accessToken) {
            exitChat(chat.id, accessToken).then((success) => {
                if (success) {
                    //TODO: хз пока че выводить, вероятно удалять панель с чатом
                }
                else {
                    console.error("Ошибка при попытки входа в чат. Повторите попытку или попробуйте позже");
                }
            }).catch(() => {
                console.error("Ошибка при попытки входа в чат. Повторите попытку или попробуйте позже");
            })
        }
        else {
            console.error("Токен авторизации (access token) === undefied!");
            //TODO: вывести на экран
        }
    }, [accessToken, chat]);

    return (
        <div className={styles.chatInfoContainer}>
            <div className={styles.avatarWrapper}>
                <div className={styles.avatarPlaceholder}>
                    <LargeChatAvatar chat={chat} circle size="large-xl" />
                </div>
            </div>

            <div className={styles.infoBlock}>
                <div className={styles.NameStyle}>
                    {chat.name}
                </div>
                <div className={styles.tagStyle}>
                    @{chat.tag}
                </div>
                <div className={styles.tagStyle}>
                    id: {chat.id}
                </div>
                {members instanceof Map && 
                <div className={styles.tagStyle}>
                    {members.size} участников
                </div>}
                <div className={styles.descriptionStyle}>
                    {chat.description}
                </div>

                <div className={styles.membersWindow}>
                    {members === "start state" && <div>Loading members...</div>}
                    {members === "not found" && <div>Not found members (вероятно ошибка)</div>}

                    {members instanceof Map && (
                        <>
                            {[...members.entries()].slice(0, 10).map(([userId, fields]) => (
                                <div key={userId} className={styles.memberRow}>
                                    <UserAndHisRoleCell
                                        id={userId}
                                        roleId={fields.roleId}
                                        onClick={() => {}}
                                        avatarSize="small"
                                        circle
                                    />
                                </div>
                            ))}

                            {members.size > 10 && (
                                <button className={styles.showAllBtn}>
                                    Показать всех {members.size} участников
                                </button>
                            )}
                        </>
                    )}
                </div>


                <div className={styles.actions}>
                    {!myChatIds.has(chat.id) && <button onClick={onClickJoin} className={`${styles.iconBtn}`}>Join</button>}
                    {myChatIds.has(chat.id) && <button className={`${styles.iconBtn} ${styles.search}`}>🔍</button>}
                    {chat.ownerId === myUserId && <button className={`${styles.iconBtn} ${styles.mic}`} onClick={() => addRightNode({name: `settings ${chat.name}`, reactNode: <ChatSettings chatId={chat.id} />}, true)}>⚙️</button>}
                    {myChatIds.has(chat.id) && <button className={`${styles.iconBtn} ${styles.square}`} onClick={onClickExit}>🚪</button>}
                </div>
            </div>
        </div>
    );
}