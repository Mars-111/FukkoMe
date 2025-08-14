// hooks/useAvatar.ts
import { useState, useCallback } from 'react';
import { processAvatarFile } from '../internal/utils/avatarProcessor';
import { validateImageFile } from '../internal/utils/imageUtils';
import { useUploaderFile } from '../../files/hooks/useUploadFile';
import type { CropArea, ProcessedAvatar } from '../models/avatar';

interface UseAvatarReturn {
    processedAvatar: ProcessedAvatar | null;
    previewUrl: string | null;
    isProcessing: boolean;
    error: string | null;
    processFile: (file: File, cropArea: CropArea) => Promise<void>;
    uploadAll: () => Promise<{
        originalToken: string | null;
        mediumToken: string | null;
        smallToken: string | null;
    }>;
    clear: () => void;
}

export function useAvatar(): UseAvatarReturn {
    const [processedAvatar, setProcessedAvatar] = useState<ProcessedAvatar | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const uploaderFile = useUploaderFile();

    const processFile = useCallback(async (file: File, cropArea: CropArea) => {
        if (!validateImageFile(file)) {
            setError('Поддерживаются только PNG и JPEG файлы');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const processed = await processAvatarFile(file, cropArea);
            setProcessedAvatar(processed);
            
            // Создаем превью
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            const url = URL.createObjectURL(processed.medium);
            setPreviewUrl(url);
        
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка при обработке изображения');
        } finally {
            setIsProcessing(false);
        }
    }, [previewUrl]);

    const uploadAll = useCallback(async () => {
        if (!processedAvatar) {
            setError('Нет обработанного изображения для загрузки');
            return {
                originalToken: null,
                mediumToken: null,
                smallToken: null
            };
        }

        try {
            const [originalToken, mediumToken, smallToken] = await Promise.all([
                uploaderFile.upload(processedAvatar.original, false),
                uploaderFile.upload(processedAvatar.medium, false),
                uploaderFile.upload(processedAvatar.small, false)
            ]);

            return {
                originalToken,
                mediumToken,
                smallToken
            };
        } catch (err) {
            setError('Ошибка при загрузке файлов');
            return {
                originalToken: null,
                mediumToken: null,
                smallToken: null
            };
        }
    }, [processedAvatar, uploaderFile]);

    const clear = useCallback(() => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        setProcessedAvatar(null);
        setError(null);
        setIsProcessing(false);
    }, [previewUrl]);

    return {
        processedAvatar,
        previewUrl,
        isProcessing,
        error,
        processFile,
        uploadAll,
        clear
    };
}