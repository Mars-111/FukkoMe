import { create } from "zustand";
import type { ResultEntity } from "../models/ResultEntity";


type SearchCacheResultsType = {
    // query: string,
    // setQuery: (newQuery: string) => void,
    resultsMap: Map<string, ResultEntity[]>,
    setResultsInMap: (query: string, newResults: ResultEntity[]) => void,
    addResultToMap: (query: string, result: ResultEntity) => void
};

export const useGlobalSearchStore = create<SearchCacheResultsType>((set, get) => ({
    // query: "",
    // setQuery: (newQuery: string): void => {
    //     set({ query: newQuery });
    // },
    resultsMap: new Map<string, ResultEntity[]>(),
    setResultsInMap: (queryKey: string, newResults: ResultEntity[]): void => {
        set((state) => {
            const updateResultsMap = new Map(state.resultsMap);
            updateResultsMap.set(queryKey, newResults);
            return { resultsMap: updateResultsMap };
        });
    },
    addResultToMap: (queryKey: string, result: ResultEntity): void => {
        set((state) => {
            const updateResultsMap = new Map(state.resultsMap);
            const queryResults = updateResultsMap.get(queryKey) || [];
            updateResultsMap.set(queryKey, [...queryResults, result]);
            return { resultsMap: updateResultsMap };
        });
    }
}));