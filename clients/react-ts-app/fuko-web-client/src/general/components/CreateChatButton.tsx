import { useNavigate, useSearchParams } from 'react-router-dom';
import './CreateChatButton.css';
import { useCallback } from 'react';


export function CreateChatButton() {
    const [searchParams, setSearchParams] = useSearchParams();

    const handleClick = useCallback(() => {
        searchParams.set("chat-create", "");
        setSearchParams(searchParams);
    }, [searchParams, setSearchParams]);

    return (
        <button className="create-chat-button" onClick={handleClick}>
            +
        </button>
    );
}