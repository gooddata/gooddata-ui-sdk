// (C) 2025-2026 GoodData Corporation

(globalThis as any).window = {
    location: {
        hostname: "localhost",
    },
    localStorage: {
        store: {} as Record<string, string>,
        getItem(key: string) {
            return this.store[key] ?? null;
        },
        setItem(key: string, value: string) {
            this.store[key] = String(value);
        },
        removeItem(key: string) {
            delete this.store[key];
        },
        clear() {
            this.store = {};
        },
    },
};
