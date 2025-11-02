import { useCallback, useEffect, useState } from "react";
import { SearchInput } from "./SearchInput";
import { SearchResult } from "./SearchResult";
import { RecentEntities } from "./RecentEntities";
import { matchPath, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import './GlobalSearch.css';
import type { ResultEntity } from "../models/ResultEntity";

export function GlobalSearch() {
    const [query, setQuery] = useState<string>("");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const onChangeQuery = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        if (value.trim() === "") {
            navigate("", { replace: true }); // убираем query string полностью
        } else {
            navigate(`?search=${encodeURIComponent(value)}`, { replace: true });
        }
    }, [navigate]);

    // синхронизируем query с URL при загрузке / смене URL
    useEffect(() => {
        const searchParam = searchParams.get("search") ?? "";
        setQuery(searchParam);
    }, [searchParams]);

    const entityOpened = !!matchPath("/app/search/:type/:id", location.pathname);

    const onClickResult = (entity: ResultEntity) => {
        navigate(`/app/search/${entity.type}/${entity.id}?search=${encodeURIComponent(query)}`);
    }

    return (
        <div className="global-search-container">
            <div className="search">
                <SearchInput value={query} onChange={onChangeQuery} placeholder="Search" autoFocus={true} />
                {query.length > 2 && (
                    <>
                        <p className="content-type">Result</p>
                        <SearchResult onClickEntity={onClickResult} limit={20} query={query} searchTypes={["users", "chats"]} timeoutMs={400} />
                    </>
                )}
                {query.length < 3 && (
                    <>
                        <p className="content-type">Recent</p>
                        <RecentEntities baseOpenEntityUrl="/app/search" limit={20} />
                    </>
                )}
            </div>
            {entityOpened &&
                <div className="entity">
                    <Outlet />
                </div>
            }
        </div>
    );
}