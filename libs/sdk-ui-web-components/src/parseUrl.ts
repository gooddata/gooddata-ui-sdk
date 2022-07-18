// (C) 2022 GoodData Corporation

import invariant from "ts-invariant";

/**
 * "none" means programmatic backend setup
 * "sso" means automatic Tiger SSO with redirection
 * "bearSso" means Service-provider initiated SAML SSO on Bear
 * "bear" means no SSO, just redirect to /account.html on the Bear server
 */
export type AuthType = "none" | "sso" | "bearSso" | "bear";

const mapAuthType = (auth: string | null): AuthType => {
    switch (auth) {
        case "sso":
        case "bearSso":
        case "bear":
            return auth;
        case "none":
        default:
            return "none";
    }
};

/**
 * @internal
 *
 * TODO rewrite this once specs on infra are clarified, versioned etc.
 *  For now, assuming URL pattern: https://[host]/components/[workspaceId].js[?auth=sso]
 */
export const parseUrl = (scriptUrl: URL) => {
    const protocol = scriptUrl.protocol.toLowerCase() === "http:" ? "http:" : "https:";
    const host = scriptUrl.host;
    const workspaceId = scriptUrl.pathname.match(/^\/components\/([^./]+)(\.js)?$/i)?.[1];
    const authType: AuthType = mapAuthType(scriptUrl.searchParams.get("auth"));

    invariant(workspaceId, "Unable to parse workspace id based on the script URL");

    return { hostname: `${protocol}//${host}`, workspaceId, authType };
};
