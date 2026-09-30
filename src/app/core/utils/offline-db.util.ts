// Minimal promise wrapper over IndexedDB for the offline POS. Two stores:
//  - "catalog": the last product list the POS loaded, per pharmacy
//  - "sales":   sales made while the server was unreachable, waiting to sync
// Kept dependency-free on purpose; the data is small (one catalog, a queue).

const DB_NAME = 'smartpharma-offline';
const DB_VERSION = 1;
export const CATALOG_STORE = 'catalog';
export const SALES_STORE = 'sales';

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(CATALOG_STORE)) {
          db.createObjectStore(CATALOG_STORE);
        }
        if (!db.objectStoreNames.contains(SALES_STORE)) {
          db.createObjectStore(SALES_STORE, { keyPath: 'clientSaleId' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };
    });
  }
  return dbPromise;
}

function run<T>(store: string, mode: IDBTransactionMode, action: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then((db) => new Promise<T>((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const request = action(tx.objectStore(store));
    tx.oncomplete = () => resolve(request.result as T);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  }));
}

export const offlineDb = {
  get: <T>(store: string, key: IDBValidKey) => run<T | undefined>(store, 'readonly', (s) => s.get(key)),
  getAll: <T>(store: string) => run<T[]>(store, 'readonly', (s) => s.getAll()),
  put: <T>(store: string, value: T, key?: IDBValidKey) =>
    run<IDBValidKey>(store, 'readwrite', (s) => (key === undefined ? s.put(value) : s.put(value, key))),
  delete: (store: string, key: IDBValidKey) => run<undefined>(store, 'readwrite', (s) => s.delete(key))
};
