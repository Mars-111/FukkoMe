import { Search } from "lucide-react";
// import "./SearchInput.css";
import { Input } from "./Input";



export function SearchInput({ onChange, placeholder, cacheKey, onFocus, autoFocus, value }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onFocus?: () => void, placeholder?: string, cacheKey?: string, autoFocus: boolean, value?: string }) {
    return (
        <Input type="text" value={value} cacheKey={cacheKey} placeholder={placeholder || "Search..."} onChange={onChange} onFocus={onFocus} autoFocus={true} leftIcon={<Search className="search-icon" />} />
    );
}