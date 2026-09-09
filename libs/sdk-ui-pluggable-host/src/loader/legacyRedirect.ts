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

// Where the standalone home-ui pages live inside the host: the gdc-home-ui module is mounted
// on the organization scope under this route base, and keeps the legacy path shape below it.
const HOME_UI_ROUTE_BASE = "/organization/settings";

// Top-level paths the standalone home-ui served from the root. `/workspaces/{id}/catalog` is
// deliberately NOT special-cased onto the catalog application: the module's own route already
// checks that the catalog is enabled for the workspace before handing off, and rewriting straight
// to `/workspace/{id}/catalog` would reach the host with no such check and render "app not found".
const LEGACY_HOME_PATHS = [
    "/workspaces",
    "/data-sources",
    "/users-and-groups",
    "/settings",
    "/configuration",
    "/automations",
    "/ai-hub",
    "/getting-started",
];

/**
 * Maps a legacy KD/AD/modeler/metrics/home-ui URL (embedded or standalone) to its host equivalent,
 * or `null` when it is not a recognized legacy URL. Mirrors the standalone→host redirects that live
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

    // `/settings#ai[...]` is a supported AI Hub deeplink, but the module's `/settings` route
    // redirects to `/configuration` without the hash, so the deeplink must be resolved here.
    if (isUnder(pathname, "/settings") && (hash === "#ai" || hash.startsWith("#ai/"))) {
        return `${HOME_UI_ROUTE_BASE}/ai-hub${search}${hash}`;
    }

    if (LEGACY_HOME_PATHS.some((prefix) => isUnder(pathname, prefix))) {
        return `${HOME_UI_ROUTE_BASE}${pathname}${search}${hash}`;
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
