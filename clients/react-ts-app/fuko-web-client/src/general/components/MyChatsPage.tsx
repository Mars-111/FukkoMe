import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { DynamicChatList } from "../../chats/components/ChatList";
import { useChatCacheMetaStore } from "../../chats/hooks/useChatCacheMetaStore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchInput } from "./SearchInput";
import { RecentEntities } from "./RecentEntities";
import { SearchResult, type SearchType } from "./SearchResult";
import type { ResultEntity } from "../models/ResultEntity";
import { addRecentEntity } from "../utils/recentEntityUtils";
import type { RecentEntity } from "../internal/db/cacheRecentEntityDb";
import { useMessengerLayoutStore } from "../../layout/messengerLayoutStore";



export function MyChatsPage() {
    const myChatIds = useChatCacheMetaStore((state) => state.myChatIds);

    const { chatId } = useParams<{ chatId: string }>();
    const [query, setQuery] = useState<string>("");
    const [searchInputFocus, setSearchInputFocus] = useState<boolean>(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const searchTypes = useMemo<SearchType[]>(() => ["users", "chats"], []);
    const navigate = useNavigate();
    
    const setSelectedRightTabId = useMessengerLayoutStore((state) => state.rightPanel.setSelectedTabId);
    
    const lazyOpenRecentEntitiesFlagRef = useRef(false);
    useEffect(() => {
        if (!lazyOpenRecentEntitiesFlagRef.current && searchInputFocus) {
            lazyOpenRecentEntitiesFlagRef.current = true;
        }
    }, [searchInputFocus])


    useEffect(() => {
        const searchParamsSearch = (searchParams.get("search") || "") as string;
        if (searchParamsSearch.length > 0) {
            setQuery(searchParamsSearch);
        }
    }, []);

    const onChangeQuery = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        if (value.trim() === "") {
            navigate("", { replace: true }); // убираем query string полностью
        } else {
            navigate(`?search=${encodeURIComponent(value)}`, { replace: true });
        }
    }, [navigate]);

    const onClickEntity = useCallback((entity: ResultEntity) => {
        setSelectedRightTabId("main");
        addRecentEntity(entity.id, entity.type);
        switch (entity.type) {
            case "user":
                navigate(`/app/user/${entity.id}`);
                break;
            case "chat":
                navigate(`/app/chat/${entity.id}`);
                break;
        }
    }, []);

    const onMouseDownRecent = useCallback((recent: RecentEntity) => {
        onClickEntity({ id: recent.entityId, type: recent.type });
    }, [onClickEntity]);
    

    const selectedChatId = Number(chatId);

    
    return (
        <div className="my-chat-page">
            <div className="find-chats">
                <SearchInput value={query} onFocus={() => setSearchInputFocus(true)} onBlur={() => setSearchInputFocus(false)} onChange={onChangeQuery} placeholder="Search" autoFocus={false} />
            </div>
            <div className="main-panel">
                <div style={{ display: (!searchInputFocus && query.length < 1) ? "block" : "none" }}>
                    <DynamicChatList chatIds={[...myChatIds]} onClickChat={(chatId) => onClickEntity({id: chatId, type: "chat"})} selectedChatId={selectedChatId}/>
                </div>
                    {lazyOpenRecentEntitiesFlagRef.current && 
                    <div style={{ display: (searchInputFocus && query.length < 3) ? "block" : "none" }}>
                        <p className="content-type">Recents:</p>
                        <RecentEntities limit={10} onMouseDown={onMouseDownRecent} />
                    </div>}
                <div style={{ display: (searchInputFocus || query.length > 0) ? "block" : "none" }}>
                    <p className="content-type">Results:</p>
                    <SearchResult onClickEntity={onClickEntity} limit={20} query={query} searchTypes={searchTypes} timeoutMs={400} />
                </div>
            </div>
        </div>
    );
}