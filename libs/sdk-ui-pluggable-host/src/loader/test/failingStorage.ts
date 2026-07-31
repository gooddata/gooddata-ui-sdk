// (C) 2026 GoodData Corporation

type StorageMethod = "getItem" | "setItem" | "removeItem";

/**
 * Runs `run` against a `localStorage` whose `method` throws, and returns how many times that
 * throwing method was actually reached — so a test can prove it exercised the failure path
 * instead of passing vacuously.
 *
 * The global is swapped out rather than spied on: under happy-dom `localStorage` is a proxy
 * whose methods do not come from `Storage.prototype` (a prototype spy is never called) and
 * whose instance spies survive `vi.restoreAllMocks()`, leaking into later tests.
 */
export function withFailingStorage(
    method: StorageMethod,
    run: () => void,
    seed: Record<string, string> = {},
): number {
    // Seeded directly, so a test can start from stored state even when `setItem` is the method
    // that throws
    const store = new Map<string, string>(Object.entries(seed));
    let failedCalls = 0;

    const fake: Pick<Storage, StorageMethod> = {
        getItem: (key) => store.get(key) ?? null,
        setItem: (key, value) => {
            store.set(key, value);
        },
        removeItem: (key) => {
            store.delete(key);
        },
    };
    fake[method] = () => {
        failedCalls++;
        throw new Error(`localStorage.${method} is unavailable`);
    };

    const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
    Object.defineProperty(globalThis, "localStorage", { value: fake, configurable: true });
    try {
        run();
    } finally {
        if (original) {
            Object.defineProperty(globalThis, "localStorage", original);
        } else {
            Reflect.deleteProperty(globalThis, "localStorage");
        }
    }

    return failedCalls;
}
