import { useEffect, useMemo, useState } from "react";
import type { ResultEntity } from "../models/ResultEntity";
import { likeUsernameAndSaveUsers } from "../../users/utils/userUtils";
import { ChatFromDbCell, UserFromDbCell } from "./EntitiesCells";
import { getChatsByLikeName, getChatsByLikeTag } from "../../chats/utils/ChatUtils";
import { useGlobalSearchStore } from "../internal/searchCacheStore";
import { useRouteEntityId } from "./routers/useRouteEnimyId";


export type SearchType = "users" | "chats";

export function SearchResult({ query, searchTypes, limit, timeoutMs, onClickEntity }: { query: string, searchTypes: SearchType[], limit: number, timeoutMs: number, onClickEntity: (entity: ResultEntity) => void }) {
    const [result, setResult] = useState<ResultEntity[] | null>(null);
    const [findingProccessers, setFindingProccessers] = useState<number>(0);

    const cachedResultsMap = useGlobalSearchStore((state) => state.resultsMap);
    const addResultToCache = useGlobalSearchStore((state) => state.addResultToMap);
    const setCacheQueryExpired  = useGlobalSearchStore((state) => state.setExpiredAt)
    const deleteResultsFromCache = useGlobalSearchStore((state) => state.deleteResultsFromMap);

    const routeEntityId = useRouteEntityId();

    const stableSearchTypes = useMemo(() => {
        return [...searchTypes];
    }, [JSON.stringify(searchTypes)]);


    useEffect(() => {
        if (query.length < 3) {
            setResult(null);
            return;
        }

        const timeout = setTimeout( async () => {
            setResult(() => []);
            const currentQuery = query;
            try {
                const fromCache = cachedResultsMap.get(currentQuery);

                if (!!fromCache && fromCache.expiredAt > Date.now()) {
                    setResultAndFilter(setResult, fromCache.entities);
                    return;
                }
                else if (!!fromCache && fromCache.expiredAt <= Date.now()) {
                    console.log("Кэш для запроса " + query + " не актуален");
                    deleteResultsFromCache(currentQuery);
                }
                else {
                    console.log("Кэш для запроса " + query + " нету");
                }

                setCacheQueryExpired(currentQuery, Date.now() + 40 * 1000);

                if (stableSearchTypes.includes("users")) {
                    setFindingProccessers(prev => prev + 1);

                    likeUsernameAndSaveUsers(currentQuery, limit).then((users) => {
                        if (users.length > 0) {
                            const mapped: ResultEntity[] = users.map(user => ({
                                type: "user",
                                id: user.id
                            }));
                            if (query === currentQuery)
                                setResultAndFilter(setResult, mapped);
                            for (const mappedUser of mapped) {
                                addResultToCache(currentQuery, mappedUser);
                            }
                        }
                    }).finally(() => {
                        setFindingProccessers(p => Math.max(0, p - 1));
                    });
                }

                if (stableSearchTypes.includes("chats")) {
                    setFindingProccessers(p => p + 1);
                    getChatsByLikeName(currentQuery, limit).then((chats) => {
                        if (chats.length > 0) {
                            const mapped: ResultEntity[] = chats.map(chat => ({
                                type: "chat",
                                id: chat.id
                            }));
                            if (query === currentQuery)
                                setResultAndFilter(setResult, mapped);
                            for (const mappedChat of mapped) {
                                addResultToCache(currentQuery, mappedChat);
                            }
                        }
                    }).finally(() => {
                        setFindingProccessers(p => Math.max(0, p - 1));
                    });

                    setFindingProccessers(p => p + 1);
                    getChatsByLikeTag(currentQuery, limit).then((chats) => {
                        if (chats.length > 0) {
                            const mapped: ResultEntity[] = chats.map(chat => ({
                                type: "chat",
                                id: chat.id
                            }));
                            if (query === currentQuery)
                                setResultAndFilter(setResult, mapped);
                            for (const mappedChat of mapped) {
                                addResultToCache(currentQuery, mappedChat);
                            }
                        }
                    }).finally(() => {
                        setFindingProccessers(p => Math.max(0, p - 1));
                    });
                }
            } catch {
                console.error("Error in <SearchResult ... />");
            }
        }, timeoutMs);

        return () => clearTimeout(timeout);
    }, [query, stableSearchTypes]);
    
    const finding = findingProccessers > 0;

    return (
        <div className="search-result">
            {query.length < 3 && <p>Тут пусто</p>}
            {query.length >= 3 && (!result || result.length === 0) && finding && <p>Finding...</p>}
            {query.length >= 3 && !finding && (!result || result.length === 0) && <p>No found</p>}
            {query.length >= 3 && !!result && result.length > 0 && (
                <div>
                    <div>
                        <p>Users:</p>
                        {result.map(result => {
                            if (result.type === "user" && searchTypes.includes("users")) {
                                return <UserFromDbCell id={result.id} onClick={() => onClickEntity(result)} key={`${result.type}-${result.id}`} avatarSize="small-medium" selected={routeEntityId?.id === result.id && routeEntityId.type === result.type} />
                            }
                        })}
                    </div>
                    <div>
                        <p>Chats:</p>
                        {result.map(result => {
                            if (result.type === "chat" && searchTypes.includes("chats")) {
                                return <ChatFromDbCell id={result.id} onClick={() => onClickEntity(result)} key={`${result.type}-${result.id}`} avatarSize="small-medium" selected={routeEntityId?.id === result.id && routeEntityId.type === result.type} countMembersPermissibleTimeDeviationMs={30*1000} />
                            }
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function setResultAndFilter(setResult: React.Dispatch<React.SetStateAction<ResultEntity[] | null>>, mapped: ResultEntity[]) {
    setResult(prev => {
        const merged = [...(prev ?? []), ...mapped];
        return merged.filter((v, i, a) => a.findIndex(x => x.id === v.id && x.type === v.type) === i);
    });
}