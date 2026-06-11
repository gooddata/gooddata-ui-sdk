// (C) 2026 GoodData Corporation

import {
    type PluggableApplicationRegistryItem,
    isRemotePluggableApplicationRegistryItem,
} from "@gooddata/sdk-model";
import { type IPluggableApp, type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

/**
 * Hostnames that trigger build-time-baked security checks on loaded apps.
 *
 * @remarks
 * These hostnames host artifacts written by external pipelines (e.g. the
 * gdc-ui-pluggable-applications playground). The build artifacts are expected
 * to embed `allowedOrganizations` and `buildTimestamp` on the exported
 * pluggable app; the host enforces both at load time. Apps loaded from any
 * other origin (same-hostname, local bundle) are not subject to these checks
 * — their integrity is already constrained by the hostname allowlist in
 * `remoteUrlSecurity.ts`.
 */
const SECURED_REMOTE_HOSTNAMES: ReadonlySet<string> = new Set(["demo-dashboard-plugins.gooddata.com"]);

/**
 * Maximum age of a secured-remote build, in milliseconds.
 *
 * @remarks
 * Demo apps shipped from the playground are explicitly time-boxed; the host
 * refuses to mount builds older than this window. App owners must rebuild
 * and redeploy at least this often, even if nothing else changed.
 */
export const BUILD_FRESHNESS_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Why a secured-remote app was rejected by {@link validateAppSecurity}.
 */
export type AppSecurityFailure =
    | { kind: "organization-not-allowed" }
    | { kind: "build-expired"; ageMs: number }
    | { kind: "metadata-missing" };

/**
 * Returns true when a remote URL points at a hostname that requires
 * build-time-baked security metadata on the loaded app.
 */
export function isSecuredRemoteUrl(url: string | undefined): boolean {
    if (!url) {
        return false;
    }
    try {
        const { hostname } = new URL(url, window.location.origin);
        return SECURED_REMOTE_HOSTNAMES.has(hostname);
    } catch {
        return false;
    }
}

/**
 * Validates the build-time-baked security metadata of a loaded pluggable app
 * against the current platform context.
 *
 * @remarks
 * Returns `undefined` when the app is not subject to these checks (i.e. it
 * was not loaded from a secured remote hostname). Otherwise returns a
 * structured failure describing the reason; the caller is responsible for
 * surfacing it via the renderer's error UI.
 *
 * The check fails closed: a secured-remote app missing either
 * `allowedOrganizations` or `buildTimestamp` — or carrying a non-finite or
 * future-dated `buildTimestamp` (which would otherwise bypass the
 * freshness window via a negative age) — is rejected with
 * `metadata-missing`. An empty allowlist is treated like any other
 * allowlist — it simply matches no organization.
 */
export function validateAppSecurity(
    app: PluggableApplicationRegistryItem,
    loadedApp: IPluggableApp,
    ctx: IPlatformContext,
    now: number = Date.now(),
): AppSecurityFailure | undefined {
    if (!isRemotePluggableApplicationRegistryItem(app)) {
        return undefined;
    }
    if (!isSecuredRemoteUrl(app.remote.url)) {
        return undefined;
    }

    if (
        !Array.isArray(loadedApp.allowedOrganizations) ||
        typeof loadedApp.buildTimestamp !== "number" ||
        !Number.isFinite(loadedApp.buildTimestamp) ||
        loadedApp.buildTimestamp > now
    ) {
        return { kind: "metadata-missing" };
    }

    const orgId = ctx.organization?.id;
    if (!orgId || !loadedApp.allowedOrganizations.includes(orgId)) {
        return { kind: "organization-not-allowed" };
    }

    const ageMs = now - loadedApp.buildTimestamp;
    if (ageMs > BUILD_FRESHNESS_WINDOW_MS) {
        return { kind: "build-expired", ageMs };
    }

    return undefined;
}

/**
 * Returns the timestamp until which a secured-remote ("demo bucket") app stays
 * within its build freshness window, or `undefined` when the app is not a
 * secured-remote app carrying a usable build timestamp.
 *
 * @remarks
 * Intended to be called only for apps that have already passed
 * {@link validateAppSecurity}. The host surfaces the returned date in a small
 * "valid till" badge so demo users can see when the build will expire.
 */
export function getSecuredRemoteAppValidUntil(
    app: PluggableApplicationRegistryItem,
    loadedApp: IPluggableApp,
): number | undefined {
    if (!isRemotePluggableApplicationRegistryItem(app)) {
        return undefined;
    }
    if (!isSecuredRemoteUrl(app.remote.url)) {
        return undefined;
    }
    if (typeof loadedApp.buildTimestamp !== "number" || !Number.isFinite(loadedApp.buildTimestamp)) {
        return undefined;
    }
    return loadedApp.buildTimestamp + BUILD_FRESHNESS_WINDOW_MS;
}
