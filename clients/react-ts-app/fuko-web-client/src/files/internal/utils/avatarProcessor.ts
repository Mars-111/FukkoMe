import type { CropArea, ProcessedAvatar } from "../../models/avatar";
import { canvasToOriginalFile, canvasToWebPFile, cropImageToSquare, loadImageFromFile, validateImageFile } from "./imageUtils";



export async function processAvatarFile(
    file: File, 
    cropArea: CropArea
): Promise<ProcessedAvatar> {
    if (!validateImageFile(file)) {
        throw new Error('Unsupported file type. Only PNG and JPEG are allowed.');
    }
    
    const image = await loadImageFromFile(file);
    
    // Создаем три размера
    const originalCanvas = cropImageToSquare(image, cropArea, 512); // Оригинал 512x512
    const mediumCanvas = cropImageToSquare(image, cropArea, 256);   // Средний 256x256  
    const smallCanvas = cropImageToSquare(image, cropArea, 64);     // Маленький 64x64
    
    // Конвертируем в файлы
    const [original, medium, small] = await Promise.all([
        canvasToOriginalFile(originalCanvas, file.type),
        canvasToWebPFile(mediumCanvas, 0.85),
        canvasToWebPFile(smallCanvas, 0.8)
    ]);
    
    return {
        original,
        medium,
        small
    };
}

// Вспомогательная функция для получения начальной области обрезки (центрированный квадрат)
export function getInitialCropArea(imageWidth: number, imageHeight: number): CropArea {
    const size = Math.min(imageWidth, imageHeight);
    const x = (imageWidth - size) / 2;
    const y = (imageHeight - size) / 2;
    
    return {
        x,
        y,
        width: size,
        height: size
    };
}