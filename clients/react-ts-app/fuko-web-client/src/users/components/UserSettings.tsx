import { useAuthContext } from "../../auth/AuthContext";
import { useUserById } from "../hooks/useUserById";
import { useState, useRef, use, useEffect } from "react";
import { updateMeRequest, type updateMeBodyInterface } from "../internal/api/userApi";
import InternalLogicError from "../../general/errors/classes/internalLogicError";
import { useFileById } from "../../files/hooks/useFileById";
import { useUploaderFile } from "../../files/hooks/useUploadFile";
import { FilePreview } from "../../files/components/FilePreview";
import { updateUser } from "../internal/utils/userCahceUtils";
import type { User } from "../models/user";
import Modal from "react-modal";
import { AvatarCropModal } from "../../files/components/AvatarCropModal";

export function UserSettings() {
    const identity = useAuthContext();
    const user = useUserById(identity.myUserId!);
    const avatar = useFileById(user?.avatarId, undefined);
    const uploaderFile = useUploaderFile(); 

    const [avatarCropModalIsOpen, setAvatarCropModalIsOpen] = useState<boolean>(false);

    const [updateUserState, setUpdateUserState] = 
        useState<"default" | "wait update" | "error update" | "success update">("default");

    const usernameInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const selectedAvatarRef = useRef<File | null>(null);

    if (!identity.authenticated) {
        return <h1>Not authenticated!</h1>
    }

    const formClick = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdateUserState("wait update");
        const accessToken = identity.getAccessToken();
        if (!accessToken)
            throw new InternalLogicError("For some reason the access token (identity.getAccessToken()) === null")

        const sendRequest = (fileTokenCreated: string | null) => {
            const body: updateMeBodyInterface = {
                username: usernameInputRef.current?.value
            };
            if (fileTokenCreated) {
                body.avatarFileCreatedToken = fileTokenCreated;
            }
            updateMeRequest(body, accessToken)
            .then((user: User) => {
                if (!user) {
                    setUpdateUserState("error update");
                    return;
                }
                setUpdateUserState("success update");
                updateUser(user);
            })
            .catch(() => {
                setUpdateUserState("error update");
            });
        };

        if (file) {
            uploaderFile.upload(file, false).then((token: string | null) => {
                console.log("File upload token: ", token);
                sendRequest(token);
            });
        } else {
            sendRequest(null);
        }
    }


    const handleAvatarChange = () => {
        selectedAvatarRef.current = avatarInputRef.current?.files?.[0] ?? null;
        setAvatarCropModalIsOpen(true);
    };

    const handleAvatarCropComplete = async (files: { original: File; small: File; big: File }) => {
        let originalToken: Promise<string | null> = uploaderFile.upload(files.original, false);
        let smallToken: Promise<string | null> = uploaderFile.upload(files.small, false);
        let bigToken: Promise<string | null> = uploaderFile.upload(files.big, false);
        if (await originalToken === null || await smallToken === null || await bigToken === null) {
            // Handle error
            console.error("Error uploading avatar files");
            return; //Само удалиться
        }
        //TODO
    };

    return (
        <div>
            <h1>User Settings:</h1>
            <form id="update-user" onSubmit={formClick}>
                {avatar && <FilePreview file={avatar} />}
                <p>Current avatar id: {avatar ? avatar.id : "No avatar"}</p>
                <div>
                    <label htmlFor="avatar">Avatar: </label>
                    <input type="file" id="avatar" name="avatar" accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} />
                </div>

                <div>
                    <Modal isOpen={avatarCropModalIsOpen} onRequestClose={() => setAvatarCropModalIsOpen(false)}>
                        <AvatarCropModal 
                            close={() => setAvatarCropModalIsOpen(false)} 
                            fileRef={selectedAvatarRef} 
                            onComplete={handleAvatarCropComplete} 
                        />
                    </Modal>
                    <button type="button" onClick={() => setAvatarCropModalIsOpen(true)}>Crop Avatar</button>
                </div>

                <div>
                    <label htmlFor="username">Username: </label>
                    <input type="text" id="username" name="username" defaultValue={user?.username} ref={usernameInputRef} required/>
                </div>
                <div>
                    <button type="submit">Сохранить</button>
                </div>
            </form>
            <div id="status">
                <p>{updateUserState}</p>
            </div>
        </div>
    );

}