// (C) 2026 GoodData Corporation

import { type IAuthCredentials } from "@gooddata/sdk-pluggable-application-model";

import { now } from "../debug.js";

import { getAuthCredentials, getBackend, reinitializeBackend } from "./backend.js";
import { PLATFORM_CONTEXT_VERSION, bootstrapApplication } from "./bootstrap.js";
import { type IBackendPlatformContext } from "./types.js";

export class HostApplicationDisabledError extends Error {
    constructor() {
        super("Host application is disabled by feature flag.");
        this.name = "HostApplicationDisabledError";
    }
}

/**
 * @alpha
 */
export interface ILoadPlatformContextCallbacks {
    onBootstrapError?: (error: string, context: string) => void;
    onLoaded?: (durationMs: number) => void;
}

export interface ILoadPlatformContextOptions {
    signal?: AbortSignal;
    auth?: IAuthCredentials;
    callbacks?: ILoadPlatformContextCallbacks;
}

function throwIfAborted(signal?: AbortSignal) {
    if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
    }
}

/**
 * This approach is not correct - the host app should only care about the first part of the URL,
 * and the module should only care about the second part.
 * Here we are crossing the boundaries, and the host app is checking the full URL.
 * The proper fix requires larger changes not only here, but in gdc-nas as well.
 * This is scheduled to happen with the gdc-reports module.
 *
 * @internal - exported for testing
 */
export function detectExportMode(): boolean {
    if (typeof window === "undefined") {
        return false;
    }
    const hash = window.location.hash;
    const query = hash.indexOf("?");
    if (query === -1) {
        return false;
    }
    for (const [key, value] of new URLSearchParams(hash.slice(query + 1))) {
        const name = key.toLowerCase();
        if ((name === "mode" || name === "displaymode") && value.toLowerCase() === "export") {
            return true;
        }
    }
    return false;
}

export async function loadPlatformContext(
    options: ILoadPlatformContextOptions = {},
): Promise<IBackendPlatformContext> {
    const start = now();

    if (options.auth) {
        reinitializeBackend(options.auth);
    }

    const backend = getBackend();
    throwIfAborted(options.signal);

    let bootstrap;
    try {
        bootstrap = await bootstrapApplication(backend);
    } catch (e) {
        options.callbacks?.onBootstrapError?.(
            e instanceof Error ? e.message : "Unknown bootstrap error",
            "loadPlatformContext",
        );
        throw e;
    }

    throwIfAborted(options.signal);

    if (bootstrap.userSettings["enableShellApplication"] !== true) {
        throw new HostApplicationDisabledError();
    }

    const elapsed = now() - start;
    options.callbacks?.onLoaded?.(elapsed);

    return {
        version: PLATFORM_CONTEXT_VERSION,
        auth: getAuthCredentials(),
        user: bootstrap.user,
        organization: bootstrap.organization,
        organizationPermissions: bootstrap.organizationPermissions,
        entitlements: bootstrap.entitlements,
        userSettings: bootstrap.userSettings,
        whiteLabeling: bootstrap.whiteLabeling,
        pantherTier: bootstrap.pantherTier,
        theme: bootstrap.theme,
        embeddingMode: window.location.pathname.startsWith("/embedded/") ? "iframe" : "none",
        isExportMode: detectExportMode(),
    };
}
