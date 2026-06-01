// (C) 2026 GoodData Corporation

/**
 * Security guard: only allow remote modules hosted on the same hostname as the host app,
 * or on an explicit allowlist of trusted hostnames (e.g. the demo-dashboard-plugins bucket).
 *
 * This is the sole safeguard preventing arbitrary third-party JavaScript from being loaded
 * as a Module Federation remote. Remote modules execute with full application privileges,
 * so loading from an untrusted origin would be equivalent to an XSS attack.
 *
 * Relative URLs (e.g. "/__CDN_URL_PLACEHOLDER__/...") always resolve to the current origin
 * and are therefore allowed. Absolute URLs from a different hostname are blocked unless the
 * hostname is in ALLOWED_REMOTE_HOSTNAMES.
 */
const ALLOWED_REMOTE_HOSTNAMES: ReadonlySet<string> = new Set([
    // infra1: s3://gdc-panther-prod-demo-dashboard-plugins (apps from gdc-ui-pluggable-applications playground)
    "demo-dashboard-plugins.gooddata.com",
]);

export function isAllowedRemoteHostname(url: string): boolean {
    try {
        const { hostname } = new URL(url, window.location.origin);
        return hostname === window.location.hostname || ALLOWED_REMOTE_HOSTNAMES.has(hostname);
    } catch {
        return false;
    }
}
