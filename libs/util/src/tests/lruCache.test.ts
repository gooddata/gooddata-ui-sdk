// (C) 2021 GoodData Corporation
import { LRUCache } from "../lruCache";

describe("LRUCache", () => {
    const InvalidMaxSizeCases: [string, number][] = [
        ["zero", 0],
        ["negative", -5],
    ];
    it.each(InvalidMaxSizeCases)("should validate %s maxSize", (_, maxSize) => {
        expect(() => new LRUCache({ maxSize })).toThrow();
    });

    const InvalidMaxAgeCases: [string, number][] = [
        ["zero", 0],
        ["negative", -5],
    ];
    it.each(InvalidMaxAgeCases)("should validate %s maxAge", (_, maxAge) => {
        expect(() => new LRUCache({ maxAge })).toThrow();
    });

    describe("get", () => {
        it("should cache items", () => {
            const cache = new LRUCache<any>();
            const item = { property: 42 };
            cache.set("foo", item);
            expect(cache.get("foo")).toBe(item);
        });

        it("should return undefined if an item is not there", () => {
            const cache = new LRUCache<any>();
            expect(cache.get("non-existent")).toBeUndefined();
        });
    });

    describe("has", () => {
        it("should return true for a key that is there", () => {
            const cache = new LRUCache<any>();
            const item = { property: 42 };
            cache.set("foo", item);
            expect(cache.has("foo")).toBe(true);
        });

        it("should return false a key is not there", () => {
            const cache = new LRUCache<any>();
            expect(cache.has("non-existent")).toBe(false);
        });
    });

    describe("set", () => {
        it("should overwrite existing key with new value", () => {
            const cache = new LRUCache<any>();
            const item = { property: 42 };
            cache.set("foo", item);

            const newItem = { something: "else" };
            cache.set("foo", newItem);

            expect(cache.get("foo")).toBe(newItem);
        });
    });

    describe("delete", () => {
        it("should remove a key that is there", () => {
            const cache = new LRUCache<any>();
            cache.set("foo", { property: 42 });

            cache.delete("foo");

            expect(cache.has("foo")).toBe(false);
        });

        it("should not touch other keys", () => {
            const cache = new LRUCache<any>();
            cache.set("foo", { property: 42 });
            cache.set("bar", { something: "else" });

            cache.delete("foo");

            expect(cache.has("bar")).toBe(true);
        });
    });

    describe("clear", () => {
        it("should clear the cache", () => {
            const cache = new LRUCache<any>();
            const item = { property: 42 };
            cache.set("foo", item);

            cache.clear();

            expect(cache.has("foo")).toBe(false);
        });
    });

    describe("maxSize", () => {
        it("should keep LRU items with get", () => {
            const cache = new LRUCache<string>({ maxSize: 2 });
            cache.set("key1", "value1");
            cache.set("key2", "value2");

            cache.get("key1");

            cache.set("key3", "value3");

            expect(cache.has("key1")).toBe(true);
            expect(cache.has("key2")).toBe(false);
        });
    });

    describe("maxAge", () => {
        async function wait(ms: number) {
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    return resolve();
                }, ms);
            });
        }

        it("should not return expired items", async () => {
            const cache = new LRUCache<string>({ maxAge: 100 });
            cache.set("foo", "bar");
            await wait(200);
            expect(cache.has("foo")).toBe(false);
        });

        it("should return non-expired items", async () => {
            const cache = new LRUCache<string>({ maxAge: 100 });
            cache.set("foo", "bar");
            await wait(50);
            expect(cache.has("foo")).toBe(true);
        });
    });
});
