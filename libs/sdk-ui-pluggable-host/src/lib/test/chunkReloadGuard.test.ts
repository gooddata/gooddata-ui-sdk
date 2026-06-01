// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    STALE_CHUNK_RELOAD_PARAM,
    installPreloadErrorHandler,
    reloadForStaleChunks,
    setStaleChunkReloadListener,
} from "../chunkReloadGuard.js";

const RELOAD_FLAG_KEY = "gd-chunk-reload-guard";
const RELOAD_LOOP_WINDOW_MS = 30_000;

describe("reloadForStaleChunks", () => {
    let replaceSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        sessionStorage.removeItem(RELOAD_FLAG_KEY);
        window.COMMITHASH = "buildA";
        replaceSpy = vi.fn();
        // happy-dom blocks direct calls to location.replace(); replace it with a spy.
        Object.defineProperty(window.location, "replace", {
            configurable: true,
            value: replaceSpy,
        });
        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        setStaleChunkReloadListener(undefined);
        sessionStorage.removeItem(RELOAD_FLAG_KEY);
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("triggers a reload on first call and writes the loop-guard flag", () => {
        reloadForStaleChunks("first");

        expect(replaceSpy).toHaveBeenCalledTimes(1);
        const flag = JSON.parse(sessionStorage.getItem(RELOAD_FLAG_KEY)!);
        expect(flag).toMatchObject({ hash: "buildA" });
        expect(typeof flag.at).toBe("number");
    });

    it("navigates with a cache-busting query param so the HTTP cache cannot replay a stale module graph", () => {
        // Why this matters: a soft window.location.reload() honours the HTTP cache.
        // Intermediate chunks are served with `Cache-Control: public, max-age=2592000`,
        // so a stale chunk from a previous deploy can stay in cache and the post-reload
        // page replays the same broken module graph. Replacing with a unique URL
        // forces the browser to treat it as a fresh navigation.
        reloadForStaleChunks("first");

        expect(replaceSpy).toHaveBeenCalledTimes(1);
        const target = new URL(replaceSpy.mock.calls[0][0]);
        const cb = target.searchParams.get(STALE_CHUNK_RELOAD_PARAM);
        expect(cb).not.toBeNull();
        expect(Number.isFinite(Number(cb))).toBe(true);
    });

    it("skips the second reload within the loop-guard window for the same build", () => {
        reloadForStaleChunks("first");
        reloadForStaleChunks("second");

        expect(replaceSpy).toHaveBeenCalledTimes(1);
    });

    it("reloads again once the loop-guard window has elapsed", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

        reloadForStaleChunks("first");
        expect(replaceSpy).toHaveBeenCalledTimes(1);

        vi.setSystemTime(new Date("2026-01-01T00:00:00Z").getTime() + RELOAD_LOOP_WINDOW_MS + 1);
        reloadForStaleChunks("second");

        expect(replaceSpy).toHaveBeenCalledTimes(2);
    });

    it("reloads again immediately when COMMITHASH differs from the stored flag (new build deployed)", () => {
        reloadForStaleChunks("first");
        window.COMMITHASH = "buildB";
        reloadForStaleChunks("second");

        expect(replaceSpy).toHaveBeenCalledTimes(2);
    });

    it("invokes the registered listener with the reason and current hash before reload", () => {
        const listener = vi.fn();
        setStaleChunkReloadListener(listener);

        reloadForStaleChunks("preload-error: foo");

        expect(listener).toHaveBeenCalledWith({ reason: "preload-error: foo", commitHash: "buildA" });
        expect(listener).toHaveBeenCalledTimes(1);
        // Listener fires before reload — verify ordering by call count snapshots
        const listenerCallOrder = listener.mock.invocationCallOrder[0];
        const reloadCallOrder = replaceSpy.mock.invocationCallOrder[0];
        expect(listenerCallOrder).toBeLessThan(reloadCallOrder);
    });

    it("does not invoke the listener when the loop guard skips the reload", () => {
        const listener = vi.fn();
        setStaleChunkReloadListener(listener);

        reloadForStaleChunks("first");
        reloadForStaleChunks("second");

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it("still reloads when the listener throws", () => {
        const listener = vi.fn(() => {
            throw new Error("tracker exploded");
        });
        setStaleChunkReloadListener(listener);

        reloadForStaleChunks("with-bad-listener");

        expect(listener).toHaveBeenCalledTimes(1);
        expect(replaceSpy).toHaveBeenCalledTimes(1);
    });

    it("ignores a corrupted loop-guard flag and reloads", () => {
        sessionStorage.setItem(RELOAD_FLAG_KEY, "not-json{{{");

        reloadForStaleChunks("after-corruption");

        expect(replaceSpy).toHaveBeenCalledTimes(1);
    });

    it("ignores a flag with the wrong shape and reloads", () => {
        sessionStorage.setItem(RELOAD_FLAG_KEY, JSON.stringify({ hash: 123, at: "not-a-number" }));

        reloadForStaleChunks("after-wrong-shape");

        expect(replaceSpy).toHaveBeenCalledTimes(1);
    });
});

describe("installPreloadErrorHandler", () => {
    let replaceSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        sessionStorage.removeItem(RELOAD_FLAG_KEY);
        window.COMMITHASH = "buildA";
        replaceSpy = vi.fn();
        Object.defineProperty(window.location, "replace", {
            configurable: true,
            value: replaceSpy,
        });
        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
        // installPreloadErrorHandler is idempotent across test files; the listener it
        // registers in the first run remains attached. That is fine because the assertions
        // below check observable outcomes (reload triggered, defaultPrevented stays false),
        // not how many handlers ran.
        installPreloadErrorHandler();
    });

    afterEach(() => {
        sessionStorage.removeItem(RELOAD_FLAG_KEY);
        vi.restoreAllMocks();
    });

    it("does NOT preventDefault on the preloadError event so the original error rethrows", () => {
        // Why this matters: Vite's preload helper rethrows the underlying error only when
        // the cancelable `vite:preloadError` event is left default-allowed. If we cancel
        // it, the helper returns undefined, Module Federation's expose factory then runs
        // `Object.assign({}, undefined)` and yields an empty module, and asPluggableApp
        // throws "does not export a valid pluggable app" — masking the real failure.
        const event = new Event("vite:preloadError", { cancelable: true });
        (event as unknown as { payload: Error }).payload = new Error("chunk 404");

        window.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(false);
        expect(replaceSpy).toHaveBeenCalledTimes(1);
    });
});
