// This file is in JS format to be easily imported by the service worker via importScripts()

const DB_NAME = 'RandomTextPickerDB';
const DB_VERSION = 1;
const STATE_STORE = 'appState';
const CONFIG_STORE = 'autoSendConfig';
const SCHEDULE_STORE = 'schedules';

// Expose functions to a global object 'DB' for the service worker
const DB = {
    openDB: () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => reject(new Error("Error opening DB"));
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STATE_STORE)) {
                    db.createObjectStore(STATE_STORE);
                }
                if (!db.objectStoreNames.contains(CONFIG_STORE)) {
                    db.createObjectStore(CONFIG_STORE);
                }
                if (!db.objectStoreNames.contains(SCHEDULE_STORE)) {
                    db.createObjectStore(SCHEDULE_STORE, { keyPath: 'id' });
                }
            };
        });
    },

    get: (storeName, key) => {
        return new Promise(async (resolve, reject) => {
            const db = await DB.openDB();
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            request.onerror = () => reject(new Error(`Error getting ${key} from ${storeName}`));
            request.onsuccess = () => resolve(request.result);
        });
    },
    
    getAll: (storeName) => {
        return new Promise(async (resolve, reject) => {
            const db = await DB.openDB();
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onerror = () => reject(new Error(`Error getting all from ${storeName}`));
            request.onsuccess = () => resolve(request.result);
        });
    },

    put: (storeName, value, key) => {
        return new Promise(async (resolve, reject) => {
            const db = await DB.openDB();
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(value, key);
            request.onerror = () => reject(new Error(`Error putting into ${storeName}`));
            request.onsuccess = () => resolve(request.result);
        });
    },
    
    delete: (storeName, key) => {
        return new Promise(async (resolve, reject) => {
            const db = await DB.openDB();
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            request.onerror = () => reject(new Error(`Error deleting from ${storeName}`));
            request.onsuccess = () => resolve(request.result);
        });
    },
    
    clear: (storeName) => {
        return new Promise(async (resolve, reject) => {
            const db = await DB.openDB();
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            request.onerror = () => reject(new Error(`Error clearing ${storeName}`));
            request.onsuccess = () => resolve(request.result);
        });
    },

    // --- App State ---
    getAppState: () => DB.get(STATE_STORE, 'main'),
    saveAppState: (state) => DB.put(STATE_STORE, state, 'main'),
    clearAppState: () => DB.delete(STATE_STORE, 'main'),

    // --- Auto Send Config ---
    getAutoSendConfig: () => DB.get(CONFIG_STORE, 'config'),
    saveAutoSendConfig: (config) => DB.put(CONFIG_STORE, config, 'config'),

    // --- Schedules ---
    getSchedules: () => DB.getAll(SCHEDULE_STORE),
    saveSchedules: async (schedules) => {
        const db = await DB.openDB();
        const tx = db.transaction(SCHEDULE_STORE, 'readwrite');
        await tx.objectStore(SCHEDULE_STORE).clear();
        for (const schedule of schedules) {
            tx.objectStore(SCHEDULE_STORE).add(schedule);
        }
        return tx.done;
    },
    deleteSchedule: (id) => DB.delete(SCHEDULE_STORE, id),
    clearSchedules: () => DB.clear(SCHEDULE_STORE),
};

// If in Service Worker, attach to self
if (typeof self !== 'undefined') {
    self.DB = DB;
}

// In main thread, we export for module usage in React
export const {
    getAppState,
    saveAppState,
    clearAppState,
    getAutoSendConfig,
    saveAutoSendConfig,
    getSchedules,
    saveSchedules,
    deleteSchedule,
    clearSchedules,
} = DB;
