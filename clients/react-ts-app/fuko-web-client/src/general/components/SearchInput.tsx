import { Search, X } from "lucide-react";
// import "./SearchInput.css";
import { Input } from "./Input";
import { useCallback, useEffect, useRef } from "react";



export function SearchInput({ onChange, placeholder, cacheKey, onFocus, autoFocus, value, onBlur }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onFocus?: () => void, placeholder?: string, cacheKey?: string, autoFocus: boolean, value?: string, onBlur?: () => void }) {
    
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (inputRef.current) {
                    inputRef.current.value = ""; // очищаем input
                }
                onChange({ target: { value: "" } } as any); // уведомляем родителя
                onBlur?.(); // убираем фокус
            }
        };

        const el = inputRef.current;
        el?.addEventListener("keydown", handleKeyDown);

        return () => el?.removeEventListener("keydown", handleKeyDown);
    }, [onBlur, onChange]);
    
    const onClearClick = useCallback(() => {
        inputRef.current?.blur();
        onChange?.({ target: { value: "" } } as any);
        onBlur?.();
    }, []);

    return (
        <Input onBlur={onBlur} type="text" value={value} cacheKey={cacheKey} placeholder={placeholder || "Search..."} onChange={onChange} onFocus={onFocus} autoFocus={autoFocus} leftIcon={<Search className="search-icon" />} rightIcon={<X style={{display: (value && value.length > 0) ? "block" : "none", cursor: "pointer" } } onClick={onClearClick} />} />
    );
}