// (C) 2022-2025 GoodData Corporation

/**
 * "none" means programmatic backend setup
 * "sso" means automatic Tiger SSO with redirection
 */
export type AuthType = "none" | "sso";

const mapAuthType = (auth: string | null): AuthType => {
    switch (auth) {
        case "sso":
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
 *  set to something like tigerBackend - this would not work as expected.
 *
 * @internal
 */
export const parseUrl = (
    scriptUrl: string,
): {
    hostname?: string;
    workspaceId?: string;
    authType: AuthType;
} => {
    let url: URL;

    try {
        url = new URL(scriptUrl);
    } catch {
        // Invalid URL provided...
        return { hostname: undefined, workspaceId: undefined, authType: "none" };
    }

    const protocol = url.protocol.toLowerCase() === "http:" ? "http:" : "https:";
    const host = url.host;
    const workspaceId = url.searchParams.has("workspace")
        ? url.searchParams.get("workspace")!
        : url.pathname.match(/^\/components\/(.+)\.js$/i)?.[1];

    const authType: AuthType = mapAuthType(url.searchParams.get("auth"));

    return { hostname: `${protocol}//${host}`, workspaceId, authType };
};
