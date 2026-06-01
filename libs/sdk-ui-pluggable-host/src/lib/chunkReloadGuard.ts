// (C) 2026 GoodData Corporation

//
// Stale-chunk recovery: after a redeploy, an old tab still references content-hashed
// chunk URLs that no longer exist on the server. Vite emits a `vite:preloadError`
// event when a dynamic import fails. We catch it, hard-reload the page once to fetch
// the new index.html, and use sessionStorage to avoid reload loops if the redeployed
// build is itself broken.
//
// The version watcher proactively detects redeploys by polling the COMMITHASH file.
// When the deployed commit differs from the one the tab was loaded with, it fires
// `onNewDeployment`; the host app forwards that to the host UI module via
// `dispatchHostNotification` so the UI can surface it (e.g. as a toast with reload).
//

interface IVitePreloadErrorEvent extends Event {
    payload: Error;
}

const RELOAD_FLAG_KEY = "gd-chunk-reload-guard";
const RELOAD_LOOP_WINDOW_MS = 30_000;

/**
 * Optional callback invoked synchronously immediately before a stale-chunk hard reload.
 * Gives the host app a chance to record telemetry before navigation cancels in-flight requests.
 *
 * @alpha
 */
export interface IStaleChunkReloadInfo {
    /** Human-readable reason — e.g. the underlying preload error message. */
    reason: string;
    /** COMMITHASH of the build the tab was loaded with, or an empty string if unknown. */
    commitHash: string;
}

/**
 * @alpha
 */
export type StaleChunkReloadListener = (info: IStaleChunkReloadInfo) => void;

let preloadErrorHandlerInstalled = false;
let versionWatcherInstalled = false;
let staleChunkReloadListener: StaleChunkReloadListener | undefined;

function readReloadFlag(): { hash: string; at: number } | undefined {
    try {
        const raw = sessionStorage.getItem(RELOAD_FLAG_KEY);
        if (!raw) {
            return undefined;
        }
        const parsed = JSON.parse(raw) as { hash?: unknown; at?: unknown };
        if (typeof parsed.hash !== "string" || typeof parsed.at !== "number") {
            return undefined;
        }
        return { hash: parsed.hash, at: parsed.at };
    } catch {
        return undefined;
    }
}

function writeReloadFlag(hash: string): void {
    try {
        sessionStorage.setItem(RELOAD_FLAG_KEY, JSON.stringify({ hash, at: Date.now() }));
    } catch {
        // sessionStorage unavailable (privacy mode, sandboxed iframe). Without the
        // anti-loop guard we accept the risk of a reload loop on a broken redeploy
        // — that is still better than a silent 404 white screen.
    }
}

function getCurrentHash(): string {
    return typeof window === "undefined" ? "" : (window.COMMITHASH ?? "");
}

/**
 * Registers a listener invoked synchronously just before a stale-chunk hard reload,
 * intended for telemetry. Called only when the reload actually happens — skipped
 * reloads (loop-guard hits) do not fire the listener.
 *
 * @remarks
 * Trackers should send the event via `navigator.sendBeacon` or `fetch` with `keepalive`
 * because the page is navigating away immediately afterwards.
 *
 * @alpha
 */
export function setStaleChunkReloadListener(listener: StaleChunkReloadListener | undefined): void {
    staleChunkReloadListener = listener;
}

/**
 * Query-string parameter appended to the URL on a stale-chunk reload. The value
 * is a timestamp; its only purpose is to make the navigation target a URL the
 * browser has never seen before, defeating any cached HTML/remoteEntry that
 * might otherwise replay the stale module graph.
 *
 * Exported so callers and tests can recognise (and strip) the marker if needed.
 *
 * @alpha
 */
export const STALE_CHUNK_RELOAD_PARAM = "_gdcr";

/**
 * Triggers a hard page reload once, guarded against loops by sessionStorage.
 *
 * If the same COMMITHASH already triggered a reload within the last 30 seconds,
 * the call is a no-op so the user is not stuck reloading a broken build.
 *
 * @remarks
 * Uses `location.replace` with a cache-busting query parameter rather than
 * `location.reload()`. A soft reload honours the HTTP cache, which has bitten
 * us when an intermediate chunk (max-age=30d) is still served from cache and
 * keeps replaying a stale module graph after the deploy moved forward. Writing
 * a unique URL forces the browser to treat it as a fresh navigation.
 *
 * @alpha
 */
export function reloadForStaleChunks(reason: string): void {
    if (typeof window === "undefined") {
        return;
    }
    const currentHash = getCurrentHash();
    const previous = readReloadFlag();

    if (previous?.hash === currentHash && Date.now() - previous.at < RELOAD_LOOP_WINDOW_MS) {
        console.error(
            `[host-runtime/chunk-reload-guard] Skipping reload for "${reason}" — already reloaded for the same build (${currentHash}) within ${RELOAD_LOOP_WINDOW_MS}ms.`,
        );
        return;
    }

    writeReloadFlag(currentHash);
    console.warn(`[host-runtime/chunk-reload-guard] Reloading page due to: ${reason}`);

    try {
        staleChunkReloadListener?.({ reason, commitHash: currentHash });
    } catch (error) {
        // Telemetry failures must never block the recovery reload.
        console.error("[host-runtime/chunk-reload-guard] Stale-chunk reload listener threw.", error);
    }

    const target = new URL(window.location.href);
    target.searchParams.set(STALE_CHUNK_RELOAD_PARAM, String(Date.now()));
    window.location.replace(target.toString());
}

/**
 * Installs a window listener for `vite:preloadError`. When fired (e.g. a chunk has
 * been removed by a redeploy), the page is hard-reloaded once to pick up new chunk
 * hashes from a fresh index.html.
 *
 * Idempotent: calling more than once registers the listener only once.
 *
 * @alpha
 */
export function installPreloadErrorHandler(): void {
    if (preloadErrorHandlerInstalled || typeof window === "undefined") {
        return;
    }
    preloadErrorHandlerInstalled = true;

    window.addEventListener("vite:preloadError", (event) => {
        const preloadEvent = event as IVitePreloadErrorEvent;
        // Do NOT preventDefault. Vite's preload helper only rethrows when the event
        // is left default-allowed; with preventDefault the helper returns undefined,
        // and downstream wrappers (notably Module Federation's expose factory, which
        // does `Object.assign({}, await import(...))`) silently produce an empty
        // module — surfacing as a misleading "does not export a valid pluggable app"
        // error from asPluggableApp instead of a preload failure. If the loop guard
        // suppresses the reload, the original rejection still gives the caller a
        // truthful failure to handle.
        reloadForStaleChunks(`vite:preloadError (${preloadEvent.payload?.message ?? "unknown"})`);
    });
}

/**
 * Options for {@link installVersionWatcher}.
 *
 * @alpha
 */
export interface IVersionWatcherOptions {
    /** URL of the COMMITHASH file emitted by the host build. */
    url: string;
    /** Poll interval in ms. Default: 5 minutes. */
    intervalMs?: number;
    /** Called once when a new deployment is detected. */
    onNewDeployment: (newHash: string) => void;
}

/**
 * Periodically polls the COMMITHASH file and fires `onNewDeployment` once when the
 * deployed commit differs from the one the tab was loaded with. Stops polling
 * after the first detection — the caller decides what to do (typically: show a
 * "please reload" banner).
 *
 * Idempotent: calling more than once is a no-op after the first invocation.
 *
 * @alpha
 */
export function installVersionWatcher({
    url,
    intervalMs = 5 * 60_000,
    onNewDeployment,
}: IVersionWatcherOptions): void {
    if (versionWatcherInstalled || typeof window === "undefined") {
        return;
    }
    const initialHash = getCurrentHash();
    if (!initialHash) {
        // Without a baseline we cannot detect change — the build did not inject COMMITHASH.
        return;
    }
    versionWatcherInstalled = true;

    let stopped = false;
    let pendingTimeoutId: number | undefined;

    const check = async (): Promise<void> => {
        if (stopped) {
            return;
        }
        try {
            const response = await fetch(url, { cache: "no-store", credentials: "same-origin" });
            if (!response.ok) {
                return;
            }
            const remoteHash = (await response.text()).trim();
            if (remoteHash && remoteHash !== initialHash && !remoteHash.startsWith("<")) {
                stopped = true;
                try {
                    onNewDeployment(remoteHash);
                } catch (error) {
                    // Don't let a broken consumer kill the watcher (although we already stopped).
                    console.error("[host-runtime/chunk-reload-guard] onNewDeployment threw.", error);
                }
            }
        } catch {
            // Network blip; try again on the next tick.
        }
    };

    const scheduleNextTick = (): void => {
        if (stopped || pendingTimeoutId !== undefined) {
            return;
        }
        // Skip ticks while the tab is hidden — the watcher resumes on visibilitychange.
        // The first poll after install is gated the same way below.
        if (document.hidden) {
            return;
        }
        pendingTimeoutId = window.setTimeout(() => {
            pendingTimeoutId = undefined;
            void check().finally(scheduleNextTick);
        }, intervalMs);
    };

    document.addEventListener("visibilitychange", () => {
        if (stopped) {
            return;
        }
        if (document.hidden) {
            // Cancel a pending tick so we don't fire it the moment the tab returns —
            // we'll schedule a fresh interval from the visibility-change instead.
            if (pendingTimeoutId !== undefined) {
                window.clearTimeout(pendingTimeoutId);
                pendingTimeoutId = undefined;
            }
            return;
        }
        scheduleNextTick();
    });

    scheduleNextTick();
}
