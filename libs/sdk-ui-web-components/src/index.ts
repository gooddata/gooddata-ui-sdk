// (C) 2022 GoodData Corporation
/**
 * This module registers GoodData's Custom Elements for Dashboard and Insight embedding.
 *
 * @remarks
 * The package registers two custom elements with the browser:
 *  - <gd-dashboard> to embed a complete dashboard into your webpage
 *  - <gd-insight> to embed a single insight into your webpage
 *
 * @packageDocumentation
 */

import { CustomElementContext, getContext, setContext } from "./context";
import { parseUrl } from "./parseUrl";
import { Insight } from "./visualizations/Insight";
import { Dashboard } from "./visualizations/Dashboard";

const authMethodsMap = {
    sso: async function configureTigerSso(hostname: string) {
        const {
            default: tigerBackend,
            ContextDeferredAuthProvider,
            redirectToTigerAuthentication,
        } = await import("./tigerBackend");

        return tigerBackend({ hostname }).withAuthentication(
            new ContextDeferredAuthProvider(redirectToTigerAuthentication),
        );
    },
    bearSso: async function configureBearSso(hostname: string) {
        const {
            default: bearBackend,
            ContextDeferredAuthProvider,
            redirectToBearSsoAuthentication,
        } = await import("./bearBackend");

        return bearBackend({ hostname }).withAuthentication(
            new ContextDeferredAuthProvider(redirectToBearSsoAuthentication),
        );
    },
    bear: async function configureBearAuth(hostname: string) {
        const {
            default: bearBackend,
            ContextDeferredAuthProvider,
            redirectToBearAuthentication,
        } = await import("./bearBackend");

        return bearBackend({ hostname }).withAuthentication(
            new ContextDeferredAuthProvider(redirectToBearAuthentication),
        );
    },
};

const initializeAutoAuth = async () => {
    let parsedUrl: ReturnType<typeof parseUrl>;

    try {
        // Detect current host based on the script's URL
        parsedUrl = parseUrl(new URL(import.meta.url));
    } catch (e) {
        // Can't parse the URL, user can still use manual configuration, though
        return;
    }

    const { hostname, authType, workspaceId } = parsedUrl;

    const getBackend = authMethodsMap[authType];

    // No auto-auth...
    if (!getBackend) return;

    const backend = await getBackend(hostname);

    setContext({ backend, workspaceId });
};

initializeAutoAuth().catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to configure automatic authentication flow", error);
});

// Register custom elements with the browser
window.customElements.define("gd-insight", Insight);
window.customElements.define("gd-dashboard", Dashboard);

// Expose context accessors in case user wants to configure custom
//  authentication flow
export { getContext, setContext, CustomElementContext };
