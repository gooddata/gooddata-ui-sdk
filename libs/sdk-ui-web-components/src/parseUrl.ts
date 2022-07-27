// (C) 2022 GoodData Corporation

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
 * @internal
 */
export const parseUrl = (scriptUrl: URL) => {
    const protocol = scriptUrl.protocol.toLowerCase() === "http:" ? "http:" : "https:";
    const host = scriptUrl.host;
    const path = scriptUrl.pathname.replace(/^\/+/, "").replace(/\/+$/, "").split("/");

    if (path.length !== 2 || path[0] !== "components") {
        throw new Error("Unable to parse workspace id based on the script URL");
    }

    const workspaceId = path[1].replace(/(\.js)?$/i, "");
    const authType: AuthType = mapAuthType(scriptUrl.searchParams.get("auth"));

    return { hostname: `${protocol}//${host}`, workspaceId, authType };
};
