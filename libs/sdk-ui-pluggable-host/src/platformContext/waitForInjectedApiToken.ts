// (C) 2026 GoodData Corporation

import {
    type AdSetApiTokenCommandData,
    GdcAdCommandType as GdcAdCommandTypeValues,
    GdcAdEventType,
    GdcProductName,
    type IGdcMessageEvent,
    isAdSetApiTokenCommandData,
} from "@gooddata/sdk-embedding";
import { messagingUtils } from "@gooddata/sdk-embedding/internal";

import { setApiToken, setJwt } from "./backend.js";

const API_TOKEN_AUTHENTICATION_PARAM = "apiTokenAuthentication";
const EMBEDDED_PATH_PREFIX = "/embedded/";

function hasFlagInQuery(query: string): boolean {
    return new URLSearchParams(query).get(API_TOKEN_AUTHENTICATION_PARAM) === "true";
}

// Extracts the query portion from a hash like "#/<route>?<query>". Standalone AD
// uses hash-based routing and the legacy iframe URL keeps the flag inside the
// hash, so the host has to look there as well as in `window.location.search`.
function getHashQuery(hash: string): string {
    const idx = hash.indexOf("?");
    return idx >= 0 ? hash.slice(idx + 1) : "";
}

/**
 * Tells the host whether the iframe URL asks for postMessage-based auth injection.
 *
 * When this returns true, the host MUST defer `backend.bootstrap()` until a
 * `SetApiToken` postMessage from the parent has been applied via `setApiToken`
 * / `setJwt`. The flag may live in either `window.location.search` (modern
 * pluggable URLs) or in the hash query (legacy AD iframe URLs).
 */
export function shouldWaitForInjectedApiToken(): boolean {
    if (!window.location.pathname.startsWith(EMBEDDED_PATH_PREFIX)) {
        return false;
    }
    return (
        hasFlagInQuery(window.location.search.replace(/^\?/, "")) ||
        hasFlagInQuery(getHashQuery(window.location.hash))
    );
}

/**
 * Performs the pre-bootstrap auth handshake AD has historically owned, but
 * lifted to the host so that pluggable AD can keep the customer-side wire
 * contract unchanged.
 *
 * Sequence:
 *   1. Configure messagingUtils to accept only `SetApiToken` from the
 *      "analyticalDesigner" product.
 *   2. Register a one-shot listener for that command.
 *   3. Emit `listeningForApiToken` to the parent frame.
 *   4. Await the parent's `SetApiToken`, apply it to the host backend, then
 *      tear the listener down so AD can register its full command set when it
 *      mounts.
 *
 * Resolves once a valid token has been applied. Rejects if `signal` aborts.
 */
export async function waitForInjectedApiToken(signal?: AbortSignal): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        let listener: ((cmd: IGdcMessageEvent<string, string, unknown>) => boolean) | undefined;

        const cleanup = () => {
            if (listener) {
                messagingUtils.removeListener(listener);
                listener = undefined;
            }
            signal?.removeEventListener("abort", onAbort);
        };

        const onAbort = () => {
            cleanup();
            reject(new DOMException("Aborted", "AbortError"));
        };

        if (signal?.aborted) {
            onAbort();
            return;
        }
        signal?.addEventListener("abort", onAbort, { once: true });

        listener = (command) => {
            if (!isAdSetApiTokenCommandData(command.data)) {
                return false;
            }
            const payload = (command.data as AdSetApiTokenCommandData).gdc.event.data;
            if (!payload) {
                return false;
            }
            const token = payload.token;
            const tokenType = payload.type ?? "gooddata";

            if (typeof token !== "string" || token.length === 0) {
                return false;
            }
            if (tokenType === "jwt" && !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) {
                return false;
            }

            try {
                if (tokenType === "jwt") {
                    setJwt(token, payload.secondsBeforeTokenExpirationToEmitReminder ?? 60);
                } else {
                    setApiToken(token);
                }
            } catch (e) {
                cleanup();
                reject(e);
                return true;
            }
            cleanup();
            resolve();
            return true;
        };

        messagingUtils.setConfig(GdcProductName.ANALYTICAL_DESIGNER, [GdcAdCommandTypeValues.SetApiToken]);
        messagingUtils.addListener(listener);
        messagingUtils.postEvent(GdcProductName.ANALYTICAL_DESIGNER, GdcAdEventType.ListeningForApiToken, {});
    });
}
