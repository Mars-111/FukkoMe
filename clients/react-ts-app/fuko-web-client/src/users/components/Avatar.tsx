import { useState, useEffect } from "react";
import { useFileById } from "../../files/hooks/useFileById";
import type { User } from "../models/user";
import "./Avatar.css"
import './AvatarTypes.css';
import './../../general/components/Shimmer.css';

// Общая логика рендера аватара
function AvatarBase({ blob, circle }: { blob: Blob; circle: boolean }) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (blob) {
            const objectUrl = URL.createObjectURL(blob);
            setUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setUrl(null);
        }
    }, [blob]);

    
    return (
        <>
            {url && <img src={url} className={`avatar-image ${circle ? 'avatar-circle' : 'avatar-square'}`} />}
            {!url && <AwaitAvatar circle={circle} />}
        </>
    );
}




type AvatarSizes = 'small' | 'large' | 'xl';

// Заглушка / ожидание
export function AwaitAvatar({ circle, size }: { circle: boolean, size?: AvatarSizes; }) {
    return (
        <div className={`avatar-placeholder shimmer ${circle ? "avatar-circle" : "avatar-square"} avatar-container-${size}`} />
    );
}

export function NoAvatar({ circle, colorId, initial, size }: { circle: boolean; colorId: number; initial: string; size?: AvatarSizes; }) {
    const [color, setColor] = useState<string>('#ccc');
    const [initialState, setInitialState] = useState(initial);

    useEffect(() => {
        if (initial.length > 0) {
            setInitialState(initial[0].toUpperCase());
        }
    }, [initial]);
    useEffect(() => {
        const getAvatarColor = (avatarId: number) => {
            const colors = ['#6b9fffff','#1a936bff','#c96c8aff','#96CEB4','#927f40ff','#DDA0DD','#de9531ff','#98D8C8','#F7DC6F','#BB8FCE'];
            const index = Math.abs(avatarId) % colors.length;
            return colors[index] || colors[0];
        };
        setColor(getAvatarColor(colorId));
    }, [colorId]);
    

    return (
    <div
      className={`avatar-placeholder ${circle ? "avatar-circle" : "avatar-square"} ${size ? `avatar-container-${size}` : undefined}`}
      style={{
        backgroundColor: color,
        borderRadius: circle ? "50%" : "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: "bold",
        fontSize: 50,
        userSelect: "none",
      }}
    >
      {initialState}
    </div>
  );
}

export function Avatar({ avatarId, circle, size, getAccessFileToken, initial }: { avatarId: number | null; circle: boolean; size?: AvatarSizes; getAccessFileToken?: () => Promise<string>, initial?: string }) {
    const file = useFileById(avatarId, getAccessFileToken);
    return (
        <div className={`avatar-container-${size}`}>
            {(!file || !file.blob) && avatarId && avatarId > 0 && <AwaitAvatar circle={circle} size="small" />}
            {file && file.blob && <AvatarBase blob={file?.blob || null} circle={circle} />}
            {!file && (avatarId === null || avatarId < 0) && <NoAvatar circle colorId={avatarId || -1} initial={initial || ""} />}
        </div>
    );
}

// Маленький аватар — без fallback
export function SmallUserAvatar({ user, circle }: { user: User; circle: boolean }) {
    const file = useFileById(user.smallAvatarId, undefined);

    return (
        <div className="avatar-container-small">
            {(!file || !file.blob) && user.smallAvatarId !== null && user.smallAvatarId > 0 && <AwaitAvatar circle={circle} size="small" />}
            {file && file.blob && <AvatarBase blob={file.blob || null} circle={circle} />}
            {!file && (user.smallAvatarId === null || user.smallAvatarId < 0) && <NoAvatar circle colorId={user.smallAvatarId || -1} initial={user.username} />}
        </div>
    );
}

// Большой аватар — с fallback на small
export function LargeUserAvatar({ user, circle }: { user: User; circle: boolean }) {
    const small = useFileById(user.smallAvatarId, undefined);
    const large = useFileById(user.largeAvatarId, undefined);
    const [blob, setBlob] = useState<Blob | null>(null);

    useEffect(() => {
        console.log("Нам передали юзера: " + user.id + " " + user.largeAvatarId);
        if (large?.blob) {
            console.log("Задаем");
            if (large.blob !== blob) setBlob(large.blob);
        } else if (small?.blob) {
            console.log("Задаем");
            if (small.blob !== blob) setBlob(small.blob);
        } else {
            console.log("Задаем");
            setBlob(null);
        }
    }, [small, large]);

    return (
        <div className="avatar-container-large">
            {blob && <AvatarBase blob={blob} circle={circle} />}
            {!blob && user.largeAvatarId !== null && user.largeAvatarId > 0 && <AwaitAvatar size="large" circle={circle} />}
            {!blob && (user.largeAvatarId === null || user.largeAvatarId < 0) && 
                <NoAvatar circle colorId={user.largeAvatarId || -1} initial={user.username} /> 
            }
        </div>
    );
}

// Полноэкранный аватар — с fallback на large/small
export function FullscreenUserAvatar({ user, circle }: { user: User; circle: boolean }) {
    const small = useFileById(user.smallAvatarId, undefined);
    const large = useFileById(user.largeAvatarId, undefined);
    const full = useFileById(user.fullscreenAvatarId, undefined);
    const [blob, setBlob] = useState<Blob | null>(null);

    useEffect(() => {
        if (full?.blob) {
            if (full.blob !== blob) setBlob(full.blob);
        } else if (large?.blob) {
            if (large.blob !== blob) setBlob(large.blob);
        } else if (small?.blob) {
            if (small.blob !== blob) setBlob(small.blob);
        } else {
            setBlob(null);
        }
    }, [small, large, full]);

    return (
        <div className="avatar-container-xl">
            {blob && user.fullscreenAvatarId !== null && user.fullscreenAvatarId > 0 && <AvatarBase blob={blob} circle={circle} />}
            {!blob && user.fullscreenAvatarId !== null && user.fullscreenAvatarId > 0 && <AwaitAvatar size="xl" circle={circle} />}
            {!blob && (user.fullscreenAvatarId === null || user.fullscreenAvatarId < 0) && 
                <NoAvatar circle colorId={user.fullscreenAvatarId || -1} initial={user.username} /> 
            }
        </div>
    );
}
