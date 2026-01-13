import { useUserById } from "../hooks/useUserById";
import { useState, useRef } from "react";
import { updateMeRequest, updateMyAvatarRequest, type UpdateMeBodyInterface, type UserProfileResponse } from "../internal/api/userApi";
import InternalLogicError from "../../general/errors/classes/internalLogicError";
import { useUploaderFile } from "../../files/hooks/useUploadFile";
import { updateUser, userFound } from "../utils/userUtils";
import type { User } from "../models/user";
import Modal from "react-modal";
import { AvatarCropModal } from "../../files/components/AvatarCropModal";
import { LargeUserAvatar } from "./Avatar";
import './AvatarTypes.css';
import { Link } from "react-router-dom";
import { Loading } from "../../general/components/Loading";
import { useIdentity } from "../../auth/hooks/useIdentity";

export function UserSettings() {
    const { myUserId } = useIdentity();
    if (!myUserId) {
        return "Loading...";
    }
    return <Settings userId={myUserId} />;
}

function Settings({ userId }: { userId: number }) {
    const { accessToken } = useIdentity();
    const user = useUserById(userId);
    const uploaderFile = useUploaderFile();

    const [avatarCropModalIsOpen, setAvatarCropModalIsOpen] = useState<boolean>(false);

    const [updateUserState, setUpdateUserState] = 
        useState<"default" | "wait update" | "error update" | "success update">("default");

    const usernameInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const selectedAvatarRef = useRef<File | null>(null);


    const formClick = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdateUserState("wait update");
        if (!accessToken)
            throw new InternalLogicError("For some reason the access token (identity.getAccessToken()) === null")

        const body: UpdateMeBodyInterface = {
            username: usernameInputRef.current?.value
        };
        


        updateMeRequest(body, accessToken)
        .then((userProfileResponse: UserProfileResponse) => {
            if (!user) {
                setUpdateUserState("error update");
                return;
            }
            const updateingUser: User = {
                id: userProfileResponse.id,
                username: userProfileResponse.username,
                version: userProfileResponse.version,
                smallAvatarId: userProfileResponse.small_avatar,
                largeAvatarId: userProfileResponse.large_avatar,
                fullscreenAvatarId: userProfileResponse.fullscreen_avatar
            }
            setUpdateUserState("success update");
            updateUser(updateingUser);
        })
        .catch(() => {
            setUpdateUserState("error update");
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

        await updateMyAvatarRequest({
            original: originalToken,
            small: smallToken,
            large: largeToken,
            fullscreen: fullscreenToken
        }, accessToken).then((userProfileResponse: UserProfileResponse) => {
            if (!userProfileResponse) {
                console.error("Error updating avatar");
                return;
            }
            const updateingUser: User = {
                id: userProfileResponse.id,
                username: userProfileResponse.username,
                version: userProfileResponse.version,
                smallAvatarId: userProfileResponse.small_avatar,
                largeAvatarId: userProfileResponse.large_avatar,
                fullscreenAvatarId: userProfileResponse.fullscreen_avatar
            };
            updateUser(updateingUser);
            setUpdateUserState("success update");
            setAvatarCropModalIsOpen(false);
        });
    };


    if (!user) {
        return <Loading />;
    }

    return (
        <div>
            <h1>User Settings:</h1>
            <form id="update-user" onSubmit={formClick}>
                <div className="avatar-container-xl">
                    {userFound(user) && <LargeUserAvatar user={user} circle />}
                </div>
                <div>
                    <label htmlFor="avatar">Avatar: </label>
                    <input type="file" id="avatar" name="avatar" accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} />
                </div>

                {userFound(user) && <p>avatar small id: {user.smallAvatarId}</p>}
                {userFound(user) && <p>avatar large id: {user.largeAvatarId}</p>}
                {userFound(user) && <p>avatar fullscreen id: {user.fullscreenAvatarId}</p>}

                {userFound(user) && <p>version: {user.version}</p>}

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
                    <label htmlFor="username">Username: </label>
                    <input type="text" id="username" name="username" defaultValue={userFound(user) ? user.username : ""} ref={usernameInputRef} required/>
                </div>
                <div>
                    <button type="submit">Сохранить</button>
                </div>
            </form>
            <div id="status">
                <p>{updateUserState}</p>
            </div>
            <div>
                <Link to="/app/user/me">Профиль</Link>
            </div>
        </div>
    );
}