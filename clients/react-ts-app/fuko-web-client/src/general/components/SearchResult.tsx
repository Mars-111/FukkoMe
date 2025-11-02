import { useEffect, useState } from "react";
import type { ResultEntity } from "../models/ResultEntity";
import { likeUsernameAndSaveUsers } from "../../users/utils/userUtils";
import { useGlobalSearchStore } from "../internal/searchCacheStore";
import { UserCell, UserFromDbCell } from "./EntitiesCells";


export type SearchType = "users" | "chats";

export function SearchResult({ query, searchTypes, limit, timeoutMs, onClickEntity }: { query: string, searchTypes: SearchType[], limit: number, timeoutMs: number, onClickEntity: (entity: ResultEntity) => void }) {
    const resultsMap = useGlobalSearchStore((state) => state.resultsMap);
    const setResultsInMap = useGlobalSearchStore((state) => state.setResultsInMap);
    const [result, setResult] = useState<ResultEntity[] | null>(null);
    const [finding, setFinding] = useState<boolean>(false);

    useEffect(() => {
        if (query.length < 3) {
            setResult(null);
            return;
        }

        const timeout = setTimeout( async () => {
            setFinding(true);
            try {
                const resultFromResultsMap = resultsMap.get(query);
                if (resultFromResultsMap && resultFromResultsMap.length > 0) {
                    resultFromResultsMap.filter((entity) => {
                        if (entity.type === "user" && searchTypes.includes("users")) {
                            return true;
                        }
                        else if (entity.type === "chat" && searchTypes.includes("chats")) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    });
                    setResult(resultFromResultsMap);
                }
                if (resultFromResultsMap === undefined) {
                    let newResult: ResultEntity[] = [];
                    
                    if (searchTypes.includes("users")) {
                        const users = await likeUsernameAndSaveUsers(query, limit);
                        if (users.length < 1) {
                            setResult(null);
                            console.log("Нету совпадений");
                            return;
                        }
    
                        for (const i of users) {
                            newResult = [...newResult, { id: i.id, type: "user" }];
                        }
                    }

                    if (searchTypes.includes("chats")) {
                        console.warn("TODO");
                        //TODO
                    }

                    if (newResult)
                        setResultsInMap(query, newResult);
                    // setResult((state) => [...(state || []), ...newResult]);
                    setResult(newResult);
                }
            } 
            catch {
                setResult(null);
            }
            finally {
                setFinding(false)
            };
        }, timeoutMs);

        return () => clearTimeout(timeout);
    }, [query]);
    
    return (
        <div className="search-result">
            {query.length < 3 && <p>Тут пусто</p>}
            {query.length >= 3 && finding && <p>Finding...</p>}
            {query.length >= 3 && !finding && result && result.length === 0 && <p>No users found</p>}
            {query.length >= 3 && !finding && result && result.length > 0 && (
                <div>
                    {result.map(result => {
                        if (result.type === "user" && searchTypes.includes("users")) {
                            return <UserFromDbCell id={result.id} onClick={() => onClickEntity(result)} key={result.id + result.type} />
                        }
                        else if (result.type === "chat" && searchTypes.includes("chats")) {
                            console.error("Пока нету чатов");
                        }
                        else {
                            console.error("Неизвестный тип результата!");
                        }
                    })}
                </div>
            )}
        </div>
    );
}

