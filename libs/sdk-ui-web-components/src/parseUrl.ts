// (C) 2022 GoodData Corporation

import invariant from "ts-invariant";

/**
 * "none" means programmatic backend setup
 * "sso" means automatic Tiger SSO with redirection
 * Bear SSO can be added as needed
 */
type AuthType = "none" | "sso";

/**
 * @internal
 *
 * TODO rewrite this once specs on infra are clarified, versioned etc.
 *  For now, assuming URL pattern: https://[host]/components/[workspaceId].js[?auth=sso]
 */
export const parseUrl = (scriptUrl: URL) => {
    const protocol = scriptUrl.protocol.toLowerCase() === "http:" ? "http" : "https";
    const host = scriptUrl.host;
    const workspaceId = scriptUrl.pathname.match(/^\/components\/([^./]+)(\.js)?$/i)?.[1];
    const authType: AuthType = scriptUrl.searchParams.get("auth") === "sso" ? "sso" : "none";

    invariant(workspaceId, "Unable to detect workspace id based on the script URL");

    return { protocol, host, workspaceId, authType };
};
