import type { CropArea } from "../../models/avatar";


export function validateImageFile(file: File): boolean {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return allowedTypes.includes(file.type);
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
        };
        
        img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
        };
        
        img.src = url;
    });
}

export function cropImageToSquare(
    image: HTMLImageElement, 
    cropArea: CropArea,
    outputSize: number
): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = outputSize;
    canvas.height = outputSize;
    
    // Рисуем обрезанное изображение
    ctx.drawImage(
        image,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        0, 0, outputSize, outputSize
    );
    
    return canvas;
}

export function canvasToWebPFile(canvas: HTMLCanvasElement, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
        if (!blob) {
            reject(new Error('Failed to convert canvas to blob'));
            return;
        }
        
        const file = new File([blob], 'avatar.webp', { type: 'image/webp' });
        resolve(file);
        }, 'image/webp', quality);
    });
}

export function canvasToOriginalFile(
    canvas: HTMLCanvasElement, 
    originalType: string,
    quality: number = 0.9
): Promise<File> {
    return new Promise((resolve, reject) => {
        const mimeType = originalType === 'image/png' ? 'image/png' : 'image/jpeg';
        
        canvas.toBlob((blob) => {
        if (!blob) {
            reject(new Error('Failed to convert canvas to blob'));
            return;
        }
        
        const extension = mimeType === 'image/png' ? 'png' : 'jpg';
        const file = new File([blob], `avatar.${extension}`, { type: mimeType });
        resolve(file);
        }, mimeType, quality);
    });
}