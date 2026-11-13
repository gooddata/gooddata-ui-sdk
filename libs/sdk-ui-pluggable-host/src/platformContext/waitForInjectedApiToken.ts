// (C) 2026 GoodData Corporation

import {
    type AdSetApiTokenCommandData,
    GdcAdEventType,
    GdcKdEventType,
    GdcProductName,
    type KdSetApiTokenCommandData,
    isAdSetApiTokenCommandData,
    isKdSetApiTokenCommandData,
} from "@gooddata/sdk-embedding";
import { messagingUtils } from "@gooddata/sdk-embedding/internal";

import { setApiToken, setJwt } from "./backend.js";

const API_TOKEN_AUTHENTICATION_PARAM = "apitokenauthentication";
const EMBEDDED_PATH_PREFIX = "/embedded/";

// The flag arrives in customer-authored URLs with inconsistent casing (the embedded apps
// parse their hash queries case-insensitively), so match the param name lowercased.
function hasFlagInQuery(query: string): boolean {
    for (const [key, value] of new URLSearchParams(query)) {
        if (key.toLowerCase() === API_TOKEN_AUTHENTICATION_PARAM && value === "true") {
            return true;
        }
    }
    return false;
}

// Extracts the query portion from a hash like "#/<route>?<query>". The embedded apps use
// hash-based routing and the legacy iframe URLs keep the flag inside the hash, so the host
// has to look there as well as in `window.location.search`.
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
 * pluggable URLs) or in the hash query (legacy iframe URLs).
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
 * The token that the parent sent, with the origin that the browser stamped on the message.
 */
export interface IInjectedApiToken {
    token: string;
    type: "gooddata" | "jwt";
    origin: string;
    /**
     * True when the parent window sent the message. Another window, for example the top page of a
     * nested frame, can also send the token, but its origin is not the origin of the parent.
     */
    isFromParent: boolean;
}

type SetApiTokenPayload = (AdSetApiTokenCommandData | KdSetApiTokenCommandData)["gdc"]["event"]["data"];

// Accepts the SetApiToken command from either embedded product — the parent page speaks
// the product namespace of the app it embeds ("analyticalDesigner" or "dashboard").
function getSetApiTokenPayload(data: unknown): SetApiTokenPayload | undefined {
    if (isAdSetApiTokenCommandData(data)) {
        return data.gdc.event.data;
    }
    if (isKdSetApiTokenCommandData(data)) {
        return data.gdc.event.data;
    }
    return undefined;
}

/**
 * Performs the pre-bootstrap auth handshake the embedded apps have historically owned,
 * lifted to the host so that pluggable apps keep the customer-side wire contract unchanged.
 *
 * Sequence:
 *   1. Register a one-shot listener for the `SetApiToken` command of either embedded
 *      product. (A raw window listener rather than `messagingUtils.addListener` — the
 *      messagingUtils filter reads a single module-wide `{product, allowlist}` config,
 *      so it cannot accept the command from both products at once.)
 *   2. Emit `listeningForApiToken` to the parent frame under both product names.
 *   3. Await the parent's `SetApiToken`, apply it to the host backend, then tear the
 *      listener down so the mounted app can register its full command set.
 *
 * Resolves with the token and the origin of its message once a valid token has been applied.
 * Rejects if `signal` aborts.
 *
 * `listeningForApiToken` is posted around the origin gate of `sdk-embedding`: the parent origin is
 * not known yet, and the parent needs this event to send the token.
 */
export async function waitForInjectedApiToken(signal?: AbortSignal): Promise<IInjectedApiToken> {
    return new Promise<IInjectedApiToken>((resolve, reject) => {
        let listener: ((e: MessageEvent) => void) | undefined;

        const cleanup = () => {
            if (listener) {
                window.removeEventListener("message", listener);
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

        listener = (e: MessageEvent) => {
            const payload = getSetApiTokenPayload(e.data);
            if (!payload) {
                return;
            }
            const token = payload.token;
            const tokenType = payload.type ?? "gooddata";

            if (typeof token !== "string" || token.length === 0) {
                return;
            }
            if (tokenType === "jwt" && !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) {
                return;
            }

            try {
                if (tokenType === "jwt") {
                    setJwt(token, payload.secondsBeforeTokenExpirationToEmitReminder ?? 60);
                } else {
                    setApiToken(token);
                }
            } catch (err) {
                cleanup();
                reject(err);
                return;
            }
            cleanup();
            resolve({ token, type: tokenType, origin: e.origin, isFromParent: e.source === window.parent });
        };

        window.addEventListener("message", listener, false);
        const exempt = { exempt: true };
        messagingUtils.postEvent(
            GdcProductName.ANALYTICAL_DESIGNER,
            GdcAdEventType.ListeningForApiToken,
            {},
            undefined,
            exempt,
        );
        messagingUtils.postEvent(
            GdcProductName.KPI_DASHBOARD,
            GdcKdEventType.ListeningForApiToken,
            {},
            undefined,
            exempt,
        );
    });
}
