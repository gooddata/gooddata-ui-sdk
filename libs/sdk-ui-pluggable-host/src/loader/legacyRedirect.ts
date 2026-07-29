// (C) 2026 GoodData Corporation

/**
 * @alpha
 */
export interface ILegacyLocation {
    pathname: string;
    hash: string;
    search: string;
}

function isUnder(pathname: string, prefix: string): boolean {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

// [/embedded]/workspace/<ws>/<app>/#/<rest> — KD and AD keep their route in the hash; the only
// embedded difference is the /embedded path prefix.
function toHashHostUrl(
    embedded: boolean,
    app: string,
    workspaceId: string,
    remainder: string,
    search: string,
): string {
    const prefix = embedded ? "/embedded" : "";
    const hash = remainder ? `#${remainder}` : "";
    return `${prefix}/workspace/${workspaceId}/${app}/${search}${hash}`;
}

/**
 * Maps a legacy KD/AD/modeler/metrics URL (embedded or standalone) to its host equivalent, or
 * `null` when it is not a recognized legacy URL. Mirrors the standalone→host redirects that live
 * in the legacy apps; runs client-side because the workspace id is in the (server-invisible) hash.
 *
 * @alpha
 */
export function mapLegacyUrlToHost(location: ILegacyLocation): string | null {
    const { pathname, hash, search } = location;

    // KD legacy hash: #/workspace|project|client/<ws>/<rest>. Lift <ws> to the path, keep <rest>.
    if (isUnder(pathname, "/dashboards")) {
        const match = /^#\/(?:workspace|project|client)\/([^/?]+)(.*)$/.exec(hash);
        return match
            ? toHashHostUrl(
                  isUnder(pathname, "/dashboards/embedded"),
                  "dashboards",
                  match[1],
                  match[2],
                  search,
              )
            : null;
    }

    // AD legacy hash: #/<ws>/<rest> — workspace is the bare first segment.
    if (isUnder(pathname, "/analyze")) {
        const match = /^#\/([^/?]+)(.*)$/.exec(hash);
        return match
            ? toHashHostUrl(isUnder(pathname, "/analyze/embedded"), "analyze", match[1], match[2], search)
            : null;
    }

    // Metric editor (standalone only): hash #/<ws>[/rest] becomes the path /workspace/<ws>/metrics[/rest].
    if (isUnder(pathname, "/metrics")) {
        const match = /^#\/([^/?]+)(.*)$/.exec(hash);
        return match ? `/workspace/${match[1]}/metrics${match[2]}` : null;
    }

    // LDM modeler (standalone only): #/<ws>[/...] → /workspace/<ws>/modeler. Deep routes have no host
    // equivalent yet; edit-mode intent is preserved as ?displayEditMode.
    if (isUnder(pathname, "/modeler")) {
        const match = /^#\/([^/?]+)/.exec(hash);
        if (!match) {
            return null;
        }
        const editMode = /displayEditMode/.test(hash + search) ? "?displayEditMode" : "";
        return `/workspace/${match[1]}/modeler${editMode}`;
    }

    return null;
}

// The host route base of each legacy standalone app, keyed by the path it was served under.
// Legacy paths and host route bases happen to coincide today, but keep the mapping explicit —
// the two are owned by different things (deployment paths vs. host registry routeBase).
const BARE_LEGACY_APP_ROUTES: Record<string, string> = {
    "/dashboards": "/dashboards",
    "/analyze": "/analyze",
    "/metrics": "/metrics",
    "/modeler": "/modeler",
};

/**
 * Detects a bare legacy app landing — /dashboards, /analyze, /metrics or /modeler with no
 * workspace in the hash. (Hash-bearing legacy URLs never get this far: {@link mapLegacyUrlToHost}
 * rewrites them synchronously before the host boots.) The legacy standalone apps redirected such
 * landings to the app in the user's first workspace; the host preserves that by resolving the
 * first workspace asynchronously, so this only maps the pathname to the target app's route base.
 *
 * @returns the host route base of the app, or `null` when the pathname is not a bare legacy app path
 */
export function mapBareLegacyPathToApp(pathname: string): string | null {
    const normalized = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
    return BARE_LEGACY_APP_ROUTES[normalized] ?? null;
}
