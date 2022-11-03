// (C) 2022 GoodData Corporation
import throttle from "lodash/throttle";
import { parseUrl } from "./parseUrl";
import { getContext, setContext } from "./context";

type AnyFunc = (...args: any[]) => any;

const GOODDATA_AUTH_FLAG = "gooddata_auth_redirect";

// Defines if during previous page load we tried to authenticate
const hadRedirectToAuth = window.sessionStorage.getItem(GOODDATA_AUTH_FLAG) === "1";

// Remove the flag right away, so that when the page is reloaded,
// the script will try to authenticate once more
window.sessionStorage.removeItem(GOODDATA_AUTH_FLAG);

const withThrottle = <T extends AnyFunc>(func: T) =>
    throttle<T>(func, 500, { leading: false, trailing: true });
const withRedirectGate =
    <T extends AnyFunc>(func: T) =>
    (...args: Parameters<T>) => {
        // Check if there was a request to the authentication
        if (hadRedirectToAuth) {
            // We already tried to authenticate, apparently it has failed...
            console.error(
                [
                    "Automatic authentication has failed! This could have happened for several reasons:",
                    " - Your browser is blocking the authentication cookies.",
                    " - The user who is trying to login exists on your SSO provider, but not on your analytics server.",
                ].join("\n"),
            );
            return;
        }

        // Write to session storage
        window.sessionStorage.setItem(GOODDATA_AUTH_FLAG, "1");
        func(...args);
    };

const authMethodsMap = {
    sso: async function configureTigerSso(hostname: string) {
        const {
            default: tigerBackend,
            ContextDeferredAuthProvider,
            redirectToTigerAuthentication,
        } = await import("./tigerBackend");

        return tigerBackend({ hostname }).withAuthentication(
            new ContextDeferredAuthProvider(withThrottle(withRedirectGate(redirectToTigerAuthentication))),
        );
    },
    bearSso: async function configureBearSso(hostname: string) {
        const {
            default: bearBackend,
            ContextDeferredAuthProvider,
            redirectToBearSsoAuthentication,
        } = await import("./bearBackend");

        return bearBackend({ hostname }).withAuthentication(
            new ContextDeferredAuthProvider(withThrottle(withRedirectGate(redirectToBearSsoAuthentication))),
        );
    },
    bear: async function configureBearAuth(hostname: string) {
        const {
            default: bearBackend,
            ContextDeferredAuthProvider,
            redirectToBearAuthentication,
        } = await import("./bearBackend");

        return bearBackend({ hostname }).withAuthentication(
            new ContextDeferredAuthProvider(withThrottle(withRedirectGate(redirectToBearAuthentication))),
        );
    },
};

const timeout = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default async (scriptSrc: string) => {
    // Detect current host based on the script's URL
    const parsedUrl = parseUrl(scriptSrc);

    const { hostname, authType, workspaceId } = parsedUrl;

    const getBackend = authMethodsMap[authType];

    if (!getBackend || !hostname) {
        // No auto-auth. Give a developer a margin of 5sec to define programmatic flow
        Promise.race([timeout(5000), getContext()]).then((res) => {
            if (!res) {
                // Resolved without a value === timeout
                // eslint-disable-next-line no-console
                console.warn(
                    `Automatic authentication with ${
                        hostname ?? "analytics server"
                    } is not enabled. You can enable it by adding "?auth=sso" to your script URL or provide authentication context programmatically with "setContext" method.`,
                );
            }
        });
        return;
    }

    const backend = await getBackend(hostname);

    setContext({ backend, workspaceId });
};
