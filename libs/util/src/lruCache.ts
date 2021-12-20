// (C) 2021 GoodData Corporation
import invariant from "ts-invariant";
import isNil from "lodash/isNil";

/**
 * @internal
 */
export interface ILRUCacheOptions {
    /**
     * Max count of items in the cache. Defaults to Infinity.
     */
    maxSize?: number;
    /**
     * Max age of items in the cache after which they are considered stale. Defaults to Infinity.
     */
    maxAge?: number;
}

interface ICacheEntry<TValue> {
    value: TValue;
    expireOn?: number;
}

/**
 * Simplistic implementation of the HashLRU algorithm with maxAge. Heavily inspired by quick-lru.
 *
 * @remarks
 * Once IE11 support is dropped, we should remove this and just use quick-lru directly. Unfortunately,
 * the version of quick-lru that supports maxAge uses generators, so it cannot be used in IE11.
 *
 * @internal
 */
export class LRUCache<TValue = unknown> {
    private maxSize: number;
    private maxAge: number | undefined;

    private cache: Map<string, ICacheEntry<TValue>>;
    private oldCache: Map<string, ICacheEntry<TValue>>;
    private currentSize: number;

    public constructor(options: ILRUCacheOptions = {}) {
        invariant(
            isNil(options.maxSize) || options.maxSize >= 1,
            "The cache max size must be a positive number",
        );
        invariant(
            isNil(options.maxAge) || options.maxAge >= 1,
            "The cache max age must be a positive number",
        );

        this.maxSize = options?.maxSize ?? Infinity;
        this.maxAge = options?.maxAge ?? undefined;

        this.cache = new Map();
        this.oldCache = new Map();

        this.currentSize = 0;
    }

    public set(key: string, value: TValue): void {
        const expireOn = this.maxAge ? Date.now() + this.maxAge : undefined;
        if (this.cache.has(key)) {
            // if the cache already has the key, re-set it with new expiry
            this.cache.set(key, { expireOn, value });
        } else {
            // else perform the set operation
            this.performSet(key, { expireOn, value });
        }
    }

    public get(key: string): TValue | undefined {
        if (this.cache.has(key)) {
            // if current cache has item, check its eviction and return it
            const entry = this.cache.get(key);
            return this.getOrEvictIfExpired(key, entry);
        }

        if (this.oldCache.has(key)) {
            // if old cache has item, check its expiry, move it to current cache and return it
            const entry = this.oldCache.get(key);
            if (!this.evictIfExpired(key, entry)) {
                this.moveToCurrent(key, entry);
                return entry.value;
            }
        }
    }

    public has(key: string): boolean {
        // check both caches for the key and evict them if they expired
        if (this.cache.has(key)) {
            return !this.evictIfExpired(key, this.cache.get(key));
        }

        if (this.oldCache.has(key)) {
            return !this.evictIfExpired(key, this.oldCache.get(key));
        }

        return false;
    }

    public delete(key: string): boolean {
        // delete from both caches but only decrement currentSize of deleted from the current cache
        const didDeleteFromCurrent = this.cache.delete(key);
        const didDeleteFromOld = this.oldCache.delete(key);

        if (didDeleteFromCurrent) {
            this.currentSize--;
        }

        return didDeleteFromOld || didDeleteFromCurrent;
    }

    public clear(): void {
        this.cache.clear();
        this.oldCache.clear();
        this.currentSize = 0;
    }

    private performSet(key: string, entry: ICacheEntry<TValue>) {
        // insert into current cache and if maxSize hit, get rid of oldCache and replace it with current
        this.cache.set(key, entry);
        this.currentSize++;

        if (this.currentSize >= this.maxSize) {
            this.currentSize = 0;
            this.oldCache = this.cache;
            this.cache = new Map();
        }
    }

    private evictIfExpired(key: string, entry: ICacheEntry<TValue>): boolean {
        if (entry.expireOn && entry.expireOn < Date.now()) {
            return this.delete(key);
        }

        return false;
    }

    private getOrEvictIfExpired(key: string, entry: ICacheEntry<TValue>): TValue | undefined {
        if (!entry.expireOn) {
            return entry.value;
        }

        const didDelete = this.evictIfExpired(key, entry);
        if (!didDelete) {
            return entry.value;
        }
    }

    private moveToCurrent(key: string, entry: ICacheEntry<TValue>) {
        // move the item to the current cache, this effectively implements the "LRU-ness"
        this.oldCache.delete(key);
        this.performSet(key, entry);
    }
}
