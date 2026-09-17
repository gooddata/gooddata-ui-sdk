// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    STALE_CHUNK_RELOAD_PARAM,
    installPreloadErrorHandler,
    reloadForStaleChunks,
    setStaleChunkReloadListener,
} from "./chunkReloadGuard.js";

const RELOAD_FLAG_KEY = "gd-chunk-reload-guard";
const RELOAD_LOOP_WINDOW_MS = 30_000;
const RELOAD_COALESCE_WINDOW_MS = 1_000;

/**
 * Start of each test's own minute on a fake clock.
 *
 * The guard coalesces recovery attempts by wall-clock time and, with isolation off, the module
 * instance is shared by the whole file. Giving each test a clock well past the previous one is
 * what stops one test's attempt from coalescing away the next test's.
 */
let testClock = Date.UTC(2026, 0, 1);

function startTestClock(): number {
    testClock += 60_000;
    vi.useFakeTimers();
    vi.setSystemTime(testClock);
    return testClock;
}

/**
 * Installs the `location.replace` spy and hands back the undo.
 *
 * `Object.defineProperty` is not something `vi.restoreAllMocks()` knows about, and with isolation
 * off both the real `location` object and `window.COMMITHASH` are shared with every other test file
 * in the worker — so each suite puts them back exactly as it found them.
 */
function stubLocationReplace(replaceSpy: ReturnType<typeof vi.fn>): () => void {
    const { location } = window;
    const originalReplace = Object.getOwnPropertyDescriptor(location, "replace");
    const originalCommitHash = Object.getOwnPropertyDescriptor(window, "COMMITHASH");

    // happy-dom blocks direct calls to location.replace(); replace it with a spy.
    Object.defineProperty(location, "replace", { configurable: true, value: replaceSpy });
    window.COMMITHASH = "buildA";

    return () => {
        if (originalReplace) {
            Object.defineProperty(location, "replace", originalReplace);
        } else {
            delete (location as unknown as Record<string, unknown>)["replace"];
        }
        if (originalCommitHash) {
            Object.defineProperty(window, "COMMITHASH", originalCommitHash);
        } else {
            delete (window as unknown as Record<string, unknown>)["COMMITHASH"];
        }
    };
}

function staleChunkEvent(): Event {
    const event = new Event("vite:preloadError", { cancelable: true });
    (event as unknown as { payload: Error }).payload = new Error("chunk 404");
    return event;
}

/**
 * A fresh copy of the guard, standing in for the module state a newly loaded document gets.
 * The loop guard spans documents — sessionStorage outlives the reload, the module does not —
 * so a suite reusing one instance to model "the page reloaded" tests something the browser
 * never does.
 */
async function freshDocument(): Promise<typeof import("./chunkReloadGuard.js")> {
    vi.resetModules();
    return import("./chunkReloadGuard.js");
}

describe("reloadForStaleChunks", () => {
    let replaceSpy: ReturnType<typeof vi.fn>;
    let restoreLocation: () => void;

    beforeEach(() => {
        sessionStorage.removeItem(RELOAD_FLAG_KEY);
        startTestClock();
        replaceSpy = vi.fn();
        restoreLocation = stubLocationReplace(replaceSpy);
        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        // Let the attempt-resolved timer run: it clears module state the next test would inherit,
        // which with isolation off is shared by the whole file.
        vi.runOnlyPendingTimers();
        setStaleChunkReloadListener(undefined);
        sessionStorage.removeItem(RELOAD_FLAG_KEY);
        restoreLocation();
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

    it("skips the reload when the reloaded document came back on the same build", async () => {
        reloadForStaleChunks("first");
        const reloaded = await freshDocument();

        reloaded.reloadForStaleChunks("second");

        expect(replaceSpy).toHaveBeenCalledTimes(1);
    });

    it("reloads again once the loop-guard window has elapsed", async () => {
        const now = vi.getMockedSystemTime()!.getTime();

        reloadForStaleChunks("first");
        expect(replaceSpy).toHaveBeenCalledTimes(1);
        const reloaded = await freshDocument();

        vi.setSystemTime(now + RELOAD_LOOP_WINDOW_MS + 1);
        reloaded.reloadForStaleChunks("second");

        expect(replaceSpy).toHaveBeenCalledTimes(2);
    });

    it("reloads again immediately when COMMITHASH differs from the stored flag (new build deployed)", async () => {
        reloadForStaleChunks("first");
        const reloaded = await freshDocument();
        window.COMMITHASH = "buildB";

        reloaded.reloadForStaleChunks("second");

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

    it("does not invoke the listener when the loop guard skips the reload", async () => {
        const listener = vi.fn();
        setStaleChunkReloadListener(listener);

        reloadForStaleChunks("first");
        const reloaded = await freshDocument();
        reloaded.setStaleChunkReloadListener(listener);
        reloaded.reloadForStaleChunks("second");

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

    it("tries again in the same document, where the flag can only be from a cancelled navigation", () => {
        // A `beforeunload` handler the user answered with "stay" cancels the navigation and
        // leaves the flag behind. Honouring it would deny the recovery to a user who has since
        // saved, for the rest of the loop-guard window.
        const now = vi.getMockedSystemTime()!.getTime();

        reloadForStaleChunks("first");
        // The prompt closes with "stay" and the thread resumes, resolving that attempt.
        vi.advanceTimersByTime(0);
        vi.setSystemTime(now + RELOAD_COALESCE_WINDOW_MS + 1);
        reloadForStaleChunks("second");

        expect(replaceSpy).toHaveBeenCalledTimes(2);
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
    let restoreLocation: () => void;

    beforeEach(() => {
        sessionStorage.removeItem(RELOAD_FLAG_KEY);
        startTestClock();
        replaceSpy = vi.fn();
        restoreLocation = stubLocationReplace(replaceSpy);
        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
        // installPreloadErrorHandler is idempotent across test files; the listener it
        // registers in the first run remains attached. That is fine because the assertions
        // below check observable outcomes (reload triggered, defaultPrevented stays false),
        // not how many handlers ran.
        installPreloadErrorHandler();
    });

    afterEach(() => {
        // Let the attempt-resolved timer run: it clears module state the next test would inherit,
        // which with isolation off is shared by the whole file.
        vi.runOnlyPendingTimers();
        sessionStorage.removeItem(RELOAD_FLAG_KEY);
        restoreLocation();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("does NOT preventDefault on the preloadError event so the original error rethrows", () => {
        // Why this matters: Vite's preload helper rethrows the underlying error only when
        // the cancelable `vite:preloadError` event is left default-allowed. If we cancel
        // it, the helper returns undefined, Module Federation's expose factory then runs
        // `Object.assign({}, undefined)` and yields an empty module, and asPluggableApp
        // throws "does not export a valid pluggable app" — masking the real failure.
        const event = staleChunkEvent();

        window.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(false);
        expect(replaceSpy).toHaveBeenCalledTimes(1);
    });

    it("reloads synchronously, before the rejection can unmount the page's unload guard", () => {
        // A rejected `React.lazy` with no error boundary above it unmounts the tree that
        // installed `beforeunload`. Deferring the reload — even by a microtask — would let that
        // happen first and discard unsaved work unasked.
        window.dispatchEvent(staleChunkEvent());

        expect(replaceSpy).toHaveBeenCalledTimes(1);
    });

    it("asks once for a burst of failures, not once per missing chunk", () => {
        // A redeploy strips many chunks at once. Every failure raises its own event, and a user
        // who answers the unload prompt with "stay" would otherwise be asked again immediately.
        window.dispatchEvent(staleChunkEvent());
        window.dispatchEvent(staleChunkEvent());
        window.dispatchEvent(staleChunkEvent());

        expect(replaceSpy).toHaveBeenCalledTimes(1);
    });

    it("stays coalesced across a slow answer to the unload prompt", () => {
        // The prompt blocks this thread, so the seconds the user spends reading it would otherwise
        // count against the window and expire it exactly as the queued events drain.
        const now = vi.getMockedSystemTime()!.getTime();
        window.dispatchEvent(staleChunkEvent());

        vi.setSystemTime(now + 5 * RELOAD_COALESCE_WINDOW_MS);
        window.dispatchEvent(staleChunkEvent());

        expect(replaceSpy).toHaveBeenCalledTimes(1);
    });

    it("restarts the window when the user gets back, not when the attempt was made", () => {
        const now = vi.getMockedSystemTime()!.getTime();
        window.dispatchEvent(staleChunkEvent());

        // The prompt closes with "stay"; the thread resumes and the pending attempt resolves.
        vi.setSystemTime(now + 5 * RELOAD_COALESCE_WINDOW_MS);
        vi.advanceTimersByTime(0);

        window.dispatchEvent(staleChunkEvent());
        expect(replaceSpy).toHaveBeenCalledTimes(1);

        vi.setSystemTime(now + 5 * RELOAD_COALESCE_WINDOW_MS + RELOAD_COALESCE_WINDOW_MS + 1);
        window.dispatchEvent(staleChunkEvent());

        expect(replaceSpy).toHaveBeenCalledTimes(2);
    });

    it("asks again once the burst is over, so a user who saved still gets their recovery", () => {
        const now = vi.getMockedSystemTime()!.getTime();
        window.dispatchEvent(staleChunkEvent());
        expect(replaceSpy).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(0);

        vi.setSystemTime(now + RELOAD_COALESCE_WINDOW_MS + 1);
        window.dispatchEvent(staleChunkEvent());

        expect(replaceSpy).toHaveBeenCalledTimes(2);
    });
});
