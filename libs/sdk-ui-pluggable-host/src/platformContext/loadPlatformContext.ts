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
        embeddingMode: "none",
    };
}
