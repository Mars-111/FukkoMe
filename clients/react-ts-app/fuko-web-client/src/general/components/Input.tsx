import React, { useCallback, useEffect, useRef } from "react";
import "./Input.css";
import { create } from "zustand";

export type InputFields = {
    text?: string
}

export type InputCacheType = {
    cacheValuesMap: Map<string, InputFields>, //кэш ключ и значение
    setCacheKey: (cacheKey: string, fields: InputFields) => void,
    clearCacheKey: (cacheKey: string) => void,
    getCachedByCacheKey: (cacheKey: string) => InputFields | null
};

export const useInputCache = create<InputCacheType>((set, get) => ({
    cacheValuesMap: new Map(),
    setCacheKey: (cacheKey: string, fields: InputFields) => {
        set((state) => {
            const newCache = new Map(state.cacheValuesMap);
            newCache.set(cacheKey, fields);
            return { cacheValuesMap: newCache };
        });
    },
    clearCacheKey: (cacheKey: string) => {
        set((state) => {
            const newCache = new Map(state.cacheValuesMap);
            newCache.delete(cacheKey);
            return { cacheValuesMap: newCache };
        });
    },
    getCachedByCacheKey: (cacheKey: string) => {
        return get().cacheValuesMap.get(cacheKey) || null;
    }
}));

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    cacheKey?: string;  
    label?: string;
    error?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void; 
    autoFocus?: boolean; // флаг для автоматического фокуса
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    value?: string;
}

export const Input: React.FC<InputProps> = ({ cacheKey, label, error, onChange, className = "", autoFocus, leftIcon, rightIcon, value, onBlur, ...props }) => {
    const getCachedByCacheKey = useInputCache((state) => state.getCachedByCacheKey);
    const setCacheKey = useInputCache((state) => state.setCacheKey);
    
    const localRef = useRef<HTMLInputElement>(null);
    
    // автофокус
    useEffect(() => {
        if (autoFocus) {
            localRef.current?.focus();
        }
    }, [autoFocus]);
    
    const onChangeAndSaveCache = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (cacheKey) {
            setCacheKey(cacheKey, { text: e.target.value });
        }

        onChange?.(e);
    },[cacheKey, setCacheKey, onChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            localRef.current?.blur();
            onChange?.({ target: { value: "" } } as any);
            onBlur?.();
        }
    }, [onChange, onBlur]);

    return (
        <div className={`input-container ${className}`}>
            {label && <label className="input-label">{label}</label>}
            <div className={`input-wrapper ${error ? "input-error" : ""}`}>
                {leftIcon && <div className="input-icon left">{leftIcon}</div>}
                <input 
                    className="input-field"
                    onChange={onChangeAndSaveCache}
                    onBlur={onBlur}
                    ref={localRef}
                    defaultValue={!value && cacheKey ? getCachedByCacheKey(cacheKey)?.text ?? undefined : undefined}
                    value={value}
                    onKeyDown={handleKeyDown}
                    {...props}
                />
                {rightIcon && <div className="input-icon right">{rightIcon}</div>}
            </div>
            {error && <p className="input-error-text">{error}</p>}
        </div>
    );
};
