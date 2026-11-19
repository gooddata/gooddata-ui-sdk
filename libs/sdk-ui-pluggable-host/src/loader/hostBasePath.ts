// (C) 2026 GoodData Corporation

/**
 * Top-level paths the standalone home-ui served from the root.
 */
export const LEGACY_HOME_PATHS = [
    "/workspaces",
    "/data-sources",
    "/users-and-groups",
    "/settings",
    "/configuration",
    "/automations",
    "/ai-hub",
    "/getting-started",
];

// The first path segment of every URL the host serves or redirects from.
const ROUTE_ROOTS = new Set(
    [
        "/embedded",
        "/organization",
        "/workspace",
        "/dashboards",
        "/analyze",
        "/metrics",
        "/modeler",
        ...LEGACY_HOME_PATHS,
    ].map((path) => path.slice(1)),
);

/**
 * A page pathname split into the prefix a reverse proxy serves the host under and the host route
 * below it.
 */
export interface IHostPathname {
    /** The proxy prefix without a trailing slash, e.g. `/ext/gdcn`; empty when there is none. */
    basePath: string;
    /** The host route, e.g. `/embedded/workspace/ws1/dashboards/`. */
    path: string;
}

/**
 * Splits a pathname at its first route root segment. The host has no configuration for the
 * prefix, so it is whatever precedes that segment. A pathname without a route root (the bare
 * prefix, or an unknown page) is left whole. On a domain-root install, an unknown first segment
 * followed by a route root (e.g. `/unknown/settings`) is read as a prefix too.
 *
 * The path is the rest of the pathname as-is, so it matches what the router sees with the base
 * path as its basename, also when a duplicate separator follows the prefix.
 */
export function splitHostBasePath(pathname: string): IHostPathname {
    const segments = pathname.split("/");
    const rootIndex = segments.findIndex((segment, index) => index > 0 && ROUTE_ROOTS.has(segment));
    if (rootIndex <= 1) {
        return { basePath: "", path: pathname };
    }
    const basePath = segments.slice(0, rootIndex).join("/").replace(/\/+$/, "");
    return { basePath, path: pathname.slice(basePath.length) };
}

// Detected once, from the URL the page loaded with: the router keeps the same basename for the life
// of the page, also on routes that no longer show a known route segment.
let pageBasePath: string | undefined;

/**
 * The prefix of the current page, empty when the host is served from the domain root.
 *
 * @remarks
 * The prefix is everything in front of the first route segment the host knows (`embedded`,
 * `workspace`, `organization` and the legacy application paths), so a prefix that contains one of
 * these segments, such as `/organization/gd`, is not detected. It is detected on the first call
 * and kept for the life of the page.
 *
 * @alpha
 */
export function getHostBasePath(): string {
    pageBasePath ??= splitHostBasePath(window.location.pathname).basePath;
    return pageBasePath;
}

/**
 * Forgets the detected prefix. Tests change the page URL between cases.
 */
export function resetHostBasePath(): void {
    pageBasePath = undefined;
}

/**
 * The current page pathname without the proxy prefix — the path the host router sees.
 */
export function getHostPathname(): string {
    const basePath = getHostBasePath();
    const { pathname } = window.location;
    // Strips the prefix the way the router strips its basename.
    if (!basePath || !pathname.toLowerCase().startsWith(basePath.toLowerCase())) {
        return pathname;
    }
    return pathname.slice(basePath.length) || "/";
}

/**
 * Whether the current page is an iframe embedding of the host.
 */
export function isEmbeddedHostPage(): boolean {
    return getHostPathname().startsWith("/embedded/");
}

/**
 * Turns a host route into the URL the browser uses. Absolute and protocol-relative URLs pass
 * through unchanged.
 */
export function withHostBasePath(url: string, basePath: string): string {
    return basePath && url.startsWith("/") && !url.startsWith("//") ? `${basePath}${url}` : url;
}
