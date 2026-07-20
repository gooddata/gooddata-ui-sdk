// (C) 2026 GoodData Corporation

import axios from "axios";
import { type CachedStorageValue, setupCache } from "axios-cache-interceptor";
import { describe, expect, it } from "vitest";

import { clearAxiosResponseCache, removeAxiosResponseCacheEntries } from "./axios.js";

const cachedValue = (data: unknown): CachedStorageValue => ({
    state: "cached",
    ttl: 60_000,
    createdAt: Date.now(),
    data: { data, headers: {}, status: 200, statusText: "OK" },
});

describe("axios response cache invalidation", () => {
    describe("removeAxiosResponseCacheEntries", () => {
        it("removes only the listed entries and keeps the rest", async () => {
            const instance = setupCache(axios.create());
            await instance.storage.set("a", cachedValue("A"));
            await instance.storage.set("b", cachedValue("B"));
            await instance.storage.set("c", cachedValue("C"));

            await removeAxiosResponseCacheEntries(instance, ["a", "c"]);

            expect((await instance.storage.get("a")).state).toBe("empty");
            expect((await instance.storage.get("c")).state).toBe("empty");
            expect((await instance.storage.get("b")).state).toBe("cached");
        });

        it("is a no-op for an empty id list", async () => {
            const instance = setupCache(axios.create());
            await instance.storage.set("a", cachedValue("A"));

            await removeAxiosResponseCacheEntries(instance, []);

            expect((await instance.storage.get("a")).state).toBe("cached");
        });

        it("does not throw for a plain (non-cache) axios instance", async () => {
            await expect(removeAxiosResponseCacheEntries(axios.create(), ["a"])).resolves.toBeUndefined();
        });
    });

    describe("clearAxiosResponseCache", () => {
        it("removes every cached entry", async () => {
            const instance = setupCache(axios.create());
            await instance.storage.set("a", cachedValue("A"));
            await instance.storage.set("b", cachedValue("B"));

            await clearAxiosResponseCache(instance);

            expect((await instance.storage.get("a")).state).toBe("empty");
            expect((await instance.storage.get("b")).state).toBe("empty");
        });

        it("does not throw for a plain (non-cache) axios instance", async () => {
            await expect(clearAxiosResponseCache(axios.create())).resolves.toBeUndefined();
        });
    });
});
