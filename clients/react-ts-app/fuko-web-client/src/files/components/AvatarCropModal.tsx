import { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import "./AvatarCropModal.css";


type AvatarCropModalProps = {
    close: () => void;
    fileRef: React.RefObject<File | null>;
    onComplete: (files: { original: File; small: File; big: File }) => Promise<void>;
};

type CroppedAreaPixels = {
    width: number;
    height: number;
    x: number;
    y: number;
};


export function AvatarCropModal({ close, fileRef, onComplete }: AvatarCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [cropping, setCropping] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const cropAreaPixelsRef = useRef<{ width: number; height: number; x: number; y: number } | null>(null);

    // загружаем выбранный файл
    if (!imageSrc && fileRef.current) {
        const objectUrl = URL.createObjectURL(fileRef.current);
        setImageSrc(objectUrl);
    }

    const onCropComplete = useCallback((_: any, croppedAreaPixels: CroppedAreaPixels) => {
        cropAreaPixelsRef.current = croppedAreaPixels;
    }, []);

    // helper: обрезка и конвертация в File
    const getCroppedFile = async (fileName: string, size?: number, webp = false) => {
        if (!imageSrc || !cropAreaPixelsRef.current) return null;

        const img = new Image();
        img.src = imageSrc;
        await new Promise((res) => (img.onload = res));

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        const { x, y, width, height } = cropAreaPixelsRef.current;

        // если size задан → ресайз
        const targetSize = size ?? width;
        canvas.width = targetSize;
        canvas.height = targetSize;

        ctx.drawImage(
            img,
            x,
            y,
            width,
            height,
            0,
            0,
            targetSize,
            targetSize
        );

        return new Promise<File>((resolve) => {
            canvas.toBlob(
                (blob) => {
                    resolve(new File([blob!], fileName, { type: webp ? "image/webp" : fileRef.current!.type }));
                },
                webp ? "image/webp" : fileRef.current!.type,
                0.8
            );
        });
    };

    const handleComplete = async () => {
        if (!fileRef.current) return;
        setCropping(true);

        const original = await getCroppedFile(fileRef.current.name);
        const small = await getCroppedFile("small.webp", 150, true);
        const big = await getCroppedFile("big.webp", 600, true);

        await onComplete({ original: original!, small: small!, big: big! });
        setCropping(false);
    };

    return (
        <div className="avatar-crop-modal">
            <div className="cropper-container">
                {imageSrc && (
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                )}
            </div>
            <div className="cropper-buttons">
                <button onClick={close}>Cancel</button>
                <button onClick={handleComplete}>Save</button>
            </div>
        </div>
    );
}
