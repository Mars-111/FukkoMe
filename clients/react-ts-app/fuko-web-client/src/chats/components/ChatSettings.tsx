import { useRef, useState } from "react";
import { useIdentity } from "../../auth/hooks/useIdentity";
import { useUploaderFile } from "../../files/hooks/useUploadFile";
import { useChatById } from "../hooks/useChatById";
import type { Chat } from "../models/chat";
import { LargeChatAvatar } from "../../users/components/Avatar";
import Modal from "react-modal";
import { AvatarCropModal } from "../../files/components/AvatarCropModal";
import InternalLogicError from "../../general/errors/classes/internalLogicError";
import type { UpdateMyChatBodyInterface } from "../internal/api/chatsApi";
import { updateChat, updateChatAvatar } from "../utils/ChatUtils";





export function ChatSettings({ chatId }: {chatId: number}) {
    const chat = useChatById(chatId);


    return (
        <>
        {chat === null && <div>Chat not found</div>}
        {chat === undefined && <div>Loading...</div>}
        {chat && <Settings chat={chat} />}
        </>
    );
}

function Settings({ chat }: { chat: Chat }) {
    const { accessToken } = useIdentity();
    const uploaderFile = useUploaderFile();

    const [avatarCropModalIsOpen, setAvatarCropModalIsOpen] = useState<boolean>(false);
    const [updateChatState, setUpdateChatState] = 
            useState<"default" | "wait update" | "error update" | "success update">("default");
    
    const nameInputRef = useRef<HTMLInputElement>(null);
    const tagInputRef = useRef<HTMLInputElement>(null);
    const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const selectedAvatarRef = useRef<File | null>(null);


    const formClick = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdateChatState("wait update");
        if (!accessToken)
            throw new InternalLogicError("For some reason the access token (identity.getAccessToken()) === null")

        const body: UpdateMyChatBodyInterface = {
            name: nameInputRef.current?.value !== chat.name ? nameInputRef.current?.value : undefined,
            tag: tagInputRef.current?.value !== chat.tag ? tagInputRef.current?.value : undefined,
            description: descriptionInputRef.current?.value !== chat.description ? descriptionInputRef.current?.value : undefined
        };

        updateChat(chat.id, body, accessToken)
        .then((chat: Chat) => {
            if (chat) 
                setUpdateChatState("success update");
            else
                setUpdateChatState("error update");
        })
        .catch(() => {
            setUpdateChatState("error update");
        });
    }

    const handleAvatarChange = () => {
        selectedAvatarRef.current = avatarInputRef.current?.files?.[0] ?? null;
        setAvatarCropModalIsOpen(true);
    };

    const handleAvatarCropComplete = async (files: { original: File; small: File; large: File; fullscreen: File }) => {
        const [originalToken, smallToken, largeToken, fullscreenToken] = await Promise.all([
            uploaderFile.upload(files.original, false),
            uploaderFile.upload(files.small, false),
            uploaderFile.upload(files.large, false),
            uploaderFile.upload(files.fullscreen, false)
        ]);
        if (originalToken === null || smallToken === null || largeToken === null || fullscreenToken === null) {
            // Handle error
            console.error("Error uploading avatar files");
            return; //Само удалиться
        }

        if (!accessToken) {
            console.error("No access token available");
            return;
        }

        await updateChatAvatar(chat.id, {
            original: originalToken,
            small: smallToken,
            large: largeToken,
            fullscreen: fullscreenToken
        }, accessToken)
        .then((chat: Chat) => {
            setUpdateChatState("success update");
        })
        .catch(() => {
            setUpdateChatState("error update");
        })
        .finally(() => {
            setAvatarCropModalIsOpen(false);
        });
    };


    return (
        <div>
            <h1>{chat.name} settings:</h1>
            <form id="update-chat" onSubmit={formClick}>
                <LargeChatAvatar chat={chat} circle />
                <div>
                    <label htmlFor="avatar">Avatar: </label>
                    <input type="file" id="avatar" name="avatar" accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} />
                </div>

                <p>avatar small id: {chat.smallAvatarId}</p>
                <p>avatar large id: {chat.largeAvatarId}</p>
                <p>avatar fullscreen id: {chat.fullscreenAvatarId}</p>

                <p>version: {chat.version}</p>

                <div>
                    <Modal isOpen={avatarCropModalIsOpen} onRequestClose={() => setAvatarCropModalIsOpen(false)}>
                        <AvatarCropModal 
                            close={() => setAvatarCropModalIsOpen(false)} 
                            fileRef={selectedAvatarRef}
                            onComplete={handleAvatarCropComplete} 
                        />
                    </Modal>
                </div>

                <div>
                    <label htmlFor="name">name: </label>
                    <input type="text" id="name" name="name" defaultValue={chat.name} ref={nameInputRef} required/>
                </div>
                <div>
                    <label htmlFor="tag">tag: </label>
                    <input type="text" id="tag" name="tag" defaultValue={chat.tag} ref={tagInputRef} required/>
                </div>
                <div>
                    <label htmlFor="description">description: </label>
                    <textarea name="description" placeholder="description" ref={descriptionInputRef} defaultValue={chat.description} />
                </div>
                
                <div>
                    <button type="submit">Сохранить</button>
                </div>
            </form>
            <div className="devolopnent">
                <div id="status">
                    <p>Save status: {updateChatState}</p>
                </div>
            </div>
        </div>
    );
}