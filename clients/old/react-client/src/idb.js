// src/idb.js
import { openDB } from 'idb';

const DB_NAME = 'messenger-db';
const DB_VERSION = 1;
const CHAT_STORE_NAME = 'chats';
const MESSAGE_STORE_NAME = 'messages';
const FILE_STORE_NAME = 'files';
const USER_STORE_NAME = 'users';

let dbPromise = null;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        let allSyncRequired = false;

        if (!db.objectStoreNames.contains(CHAT_STORE_NAME)) {
          allSyncRequired = true;

          const chats = db.createObjectStore(CHAT_STORE_NAME, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(MESSAGE_STORE_NAME)) {
          allSyncRequired = true;

          const messages = db.createObjectStore(MESSAGE_STORE_NAME, { keyPath: 'id' });
          messages.createIndex('chatId', 'chatId', { unique: false });
          messages.createIndex('chatId_timestamp', ['chatId', 'timestamp'], { unique: false });
        }

        if (!db.objectStoreNames.contains(FILE_STORE_NAME)) {
          allSyncRequired = true;

          db.createObjectStore(FILE_STORE_NAME, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(USER_STORE_NAME)) {
          allSyncRequired = true;

          db.createObjectStore(USER_STORE_NAME, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('meta')) {
          console.log('Database structure updated, full sync required');
          const metaStore = db.createObjectStore('meta', { keyPath: 'key' });
          metaStore.put({ key: 'lastSyncTime', value: null }); // Нужна полная синхронизация
        }
        else if (allSyncRequired) {
          console.log('Database structure updated, full sync required');
          const metaStore = db.transaction('meta', 'readwrite').objectStore('meta');
          metaStore.put({ key: 'lastSyncTime', value: null }); // Нужна полная синхронизация
        }
        else {
          console.log('Database structure is up to date');
        }
      },
    });
  }
  return dbPromise;
};

export const getLastSyncTime = () => {
  return localStorage.getItem('lastSyncTime') || null;
};

export const setLastSyncTime = () => {
  const now = new Date().toISOString();
  localStorage.setItem('lastSyncTime', now);
};


//Chats

export const saveChatIDB = async (chat) => {
  const db = await initDB();
  await db.put(CHAT_STORE_NAME, chat);
};

export const setChatsIDB = async (chats) => {
  const db = await initDB();
  const tx = db.transaction(CHAT_STORE_NAME, 'readwrite');
  const store = tx.objectStore(CHAT_STORE_NAME);
  
  // Clear existing chats before adding new ones
  await store.clear();

  for (const chat of chats) {
    await store.put(chat);
  }
  
  await tx.done;
};

export const getChatIDB = async (chatId) => {
  const db = await initDB();
  return db.get(CHAT_STORE_NAME, chatId);
};

export const getAllChatsIDB = async () => {
  const db = await initDB();
  return db.getAll(CHAT_STORE_NAME);
};

//

//Messages

export const saveMessageIDB = async (message) => {
  const db = await initDB();
  await db.put(MESSAGE_STORE_NAME, message);
};

export const getMessageIDB = async (messageId) => {
  const db = await initDB();
  return db.get(MESSAGE_STORE_NAME, messageId);
};

export const getAllMessagesByChatIdIDB = async (chatId) => {
  const db = await initDB();
  return db.getAllFromIndex(MESSAGE_STORE_NAME, 'chatId', chatId);
};

//

//Files

export const saveFileIDB = async (file) => {
  const db = await initDB();
  await db.put(FILE_STORE_NAME, file);
};

export const getFileIDB = async (fileId) => {
  const db = await initDB();
  return db.get(FILE_STORE_NAME, fileId);
};

//
