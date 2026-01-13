import { create } from "zustand";
import type { ResultEntity } from "../models/ResultEntity";

export type SearchCacheResultsType = {
    resultsMap: Map<string, { entities: ResultEntity[]; expiredAt: number }>;

    addResultToMap: (query: string, result: ResultEntity) => void;

    deleteResultsFromMap: (query: string) => void;

    setExpiredAt: (query: string, expiredAt: number) => void;
};

export const useGlobalSearchStore = create<SearchCacheResultsType>((set, get) => ({
    resultsMap: new Map(),

    addResultToMap: (queryKey, result) => {
        set((state) => {
            const updated = new Map(state.resultsMap);
            const existing = updated.get(queryKey);

            if (!existing) {
                // Если записи нет — создаём новую без expiredAt (0 → не задан)
                updated.set(queryKey, {
                    entities: [result],
                    expiredAt: 0
                });
            } else {
                // Добавляем entity
                const entities = [...existing.entities, result];

                // уникализируем по id + type
                const unique = entities.filter(
                    (v, i, arr) =>
                        arr.findIndex(
                            (x) => x.id === v.id && x.type === v.type
                        ) === i
                );

                updated.set(queryKey, {
                    entities: unique,
                    expiredAt: existing.expiredAt
                });
            }

            return { resultsMap: updated };
        });
    },

    deleteResultsFromMap: (query: string) => {
        set((state) => {
            const newMap = new Map(state.resultsMap);
            newMap.delete(query);
            return { resultsMap: newMap };
        });
    },

    setExpiredAt: (queryKey, expiredAt) => {
        set((state) => {
            const updated = new Map(state.resultsMap);
            const existing = updated.get(queryKey);

            if (!existing) {
                updated.set(queryKey, { entities: [], expiredAt });
            }
            else {
                updated.set(queryKey, {
                    ...existing,
                    expiredAt
                });
            }

            return { resultsMap: updated };
        });
    }
}));
