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

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { CustomElementContext, getContext, setContext } from "./context";
import { parseUrl } from "./parseUrl";
import { Insight } from "./visualizations/Insight";
import { Dashboard } from "./visualizations/Dashboard";

// Detect current host based on the script's URL
const { protocol, host, authType, workspaceId } = parseUrl(new URL(import.meta.url));

/**
 * Configure backend with a given host, automatic SSO with redirection.
 *
 * @internal
 */
async function configureTigerSso(hostname: string): Promise<IAnalyticalBackend> {
    const {
        default: tigerBackend,
        ContextDeferredAuthProvider,
        redirectToTigerAuthentication,
    } = await import("./tigerBackend");

    return tigerBackend()
        .onHostname(`${protocol}://${hostname}`)
        .withAuthentication(new ContextDeferredAuthProvider(redirectToTigerAuthentication));
}

if (authType === "sso") {
    // Perform Tiger autologin
    configureTigerSso(host)
        .then((backend) => {
            setContext({ backend, workspaceId });
        })
        .catch((error) => {
            // eslint-disable-next-line no-console
            console.error("Failed to configure automatic authentication flow", error);
        });
}

// Register custom elements with the browser
window.customElements.define("gd-insight", Insight);
window.customElements.define("gd-dashboard", Dashboard);

// Expose context accessors in case user wants to configure custom
//  authentication flow
export { getContext, setContext, CustomElementContext };
