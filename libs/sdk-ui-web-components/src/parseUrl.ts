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
 * @remarks
 * Parse script's own URL and return hostname, workspaceId and authType
 *
 * @example for URL patterns:
 *  * https://example.gooddata.com/components/my-worksapce.js - plain URL, no auto-auth
 *  * https://example.gooddata.com/components/my-workspace.js?auth=sso - auto-auth enabled for Tiger server
 *  * https://example.gooddata.com/components/index.js?workspace=my-workspace - an alternative workspaceId definition
 *
 *  An alternative way to define a workspaceId is used for a rare case when workspaceId would exactly match
 *  some other filename in the /components/ folder. I.e. nginx is set up to return the contents of the index.js
 *  instead of the /workspace-id.js only if the file workspace-id.js does not exist. If user has workspace id
 *  set to something like tigerBackend or bearBackend - this would not work as expected.
 *
 * @internal
 */
export const parseUrl = (scriptUrl: URL) => {
    const protocol = scriptUrl.protocol.toLowerCase() === "http:" ? "http:" : "https:";
    const host = scriptUrl.host;
    const workspaceId = scriptUrl.searchParams.has("workspace")
        ? scriptUrl.searchParams.get("workspace")
        : scriptUrl.pathname.match(/^\/components\/(.+)\.js$/i)?.[1];

    invariant(workspaceId, "Unable to parse workspace id based on the script URL");

    const authType: AuthType = mapAuthType(scriptUrl.searchParams.get("auth"));

    return { hostname: `${protocol}//${host}`, workspaceId, authType };
};
