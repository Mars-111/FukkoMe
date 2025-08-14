import { useRef, useState, useEffect, useCallback } from 'react';

const PENDING_STORAGE_KEY = 'pending-map-storage';

export function usePending() {
  const pendingMapRef = useRef(new Map());
  const [pendingVersion, setPendingVersion] = useState(0);

  // Загружаем из localStorage при старте
  useEffect(() => {
    const stored = localStorage.getItem(PENDING_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const restoredMap = new Map(parsed.map(([key, value]) => [key, value]));
      pendingMapRef.current = restoredMap;
      setPendingVersion(v => v + 1);
    }
  }, []);

  // Сохраняем в localStorage при изменении
  useEffect(() => {
    const serialized = JSON.stringify(Array.from(pendingMapRef.current.entries()));
    localStorage.setItem(PENDING_STORAGE_KEY, serialized);
  }, [pendingVersion]);

  const addPending = useCallback((chatId, item) => {
    const tempId = Date.now() + Math.random();
    var pendingItem = item;
    pendingItem.tempId = tempId;
    const chatPending = pendingMapRef.current.get(chatId) || [];
    pendingMapRef.current.set(chatId, [...chatPending, pendingItem]);
    setPendingVersion(v => v + 1);
    return pendingItem;
  }, []);

  const removePending = useCallback((chatId, tempId) => {
    const chatPending = pendingMapRef.current.get(chatId) || [];
    pendingMapRef.current.set(chatId, chatPending.filter(p => p.tempId !== tempId));
    setPendingVersion(v => v + 1);
  }, []);

  const markFailed = useCallback((chatId, tempId) => {
    const chatPending = pendingMapRef.current.get(chatId) || [];
    pendingMapRef.current.set(chatId, chatPending.map(p => 
      p.tempId === tempId ? { ...p, failed: true } : p
    ));
    setPendingVersion(v => v + 1);
  }, []);

  const retryPending = useCallback((chatId, tempId, retryFunc) => {
    const chatPending = pendingMapRef.current.get(chatId) || [];
    const item = chatPending.find(p => p.tempId === tempId);
    if (!item) {
      console.error('Item not found for retry:', tempId);
      return;
    }
    retryFunc(item)
      .then(() => {
        removePending(chatId, tempId);
      })
      .catch(() => {
        console.log("catch retryPending");
        markFailed(chatId, tempId);
      });
  }, [removePending, markFailed]);

  const getPendingList = useCallback((chatId) => {
    return pendingMapRef.current.get(chatId) || [];
  }, []);

  return {
    getPendingList,
    addPending,
    removePending,
    markFailed,
    retryPending,
    pendingVersion,
  };
}
