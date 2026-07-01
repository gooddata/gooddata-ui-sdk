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
