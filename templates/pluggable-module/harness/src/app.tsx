// (C) 2026 GoodData Corporation

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-kit/styles/css/indigoFont.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { type ApplicationScope, type ILocalPluggableApplicationsRegistryV1 } from "@gooddata/sdk-model";
import {
    Root,
    registerLocalApplicationLoaders,
    registerLocalApplications,
} from "@gooddata/sdk-ui-pluggable-host";

// The scope placeholder is replaced by `rush init-pluggable-app` with the chosen scope.
const APP_SCOPE = "{applicationTemplateScope}" as ApplicationScope;

// Harness-local app registry. Registers only this module so it can be developed and
// tested in isolation against a real backend without the full host app.
//
// Production: load via Module Federation (matches gdc-host-application).
//             The module's MF artifacts are served from the same nginx container under
//             /{applicationTemplateScope}/remotes/gdc-app-template-name/. Relative path keeps
//             the same-origin security guard happy.
// Dev:        fall back to a local binding so the module's source resolves through
//             the workspace graph without a second dev server. Override with
//             APP_TEMPLATE_REMOTE_URL to point at a running module dev server instead.
const localApplications: ILocalPluggableApplicationsRegistryV1 = {
    apiVersion: "1.0",
    applications: [
        {
            apiVersion: "1.0",
            id: "gdc-app-template-name",
            applicationScope: APP_SCOPE,
            menuOrder: 1,
            title: "{applicationTemplateTitle}",
            ...(PRODUCTION || APP_TEMPLATE_REMOTE_URL
                ? {
                      remote: {
                          url: PRODUCTION
                              ? "/{applicationTemplateScope}/remotes/gdc-app-template-name/remoteEntry.js"
                              : (APP_TEMPLATE_REMOTE_URL as string),
                          scope: "{applicationTemplateFederationName}",
                          module: "./pluggableApp",
                          routeBase: "/app-template-route",
                      },
                  }
                : {
                      local: { routeBase: "/app-template-route" },
                  }),
        },
    ],
};

registerLocalApplications(localApplications);
if (!PRODUCTION && !APP_TEMPLATE_REMOTE_URL) {
    registerLocalApplicationLoaders({
        "gdc-app-template-name": () => import("gdc-app-template-name-module"),
    });
}

// When the harness boots at "/", the host runtime's redirect heuristic prefers
// "/organization" for users with canManageOrganization permission — which lands a
// workspace-scoped app on the wrong scope (and renders the wrong header chrome).
// Force the initial URL into the app's chosen scope before Root mounts.
if (window.location.pathname === "/" || window.location.pathname === "") {
    const scopeRoot = APP_SCOPE === "workspace" ? "/workspace" : "/organization";
    window.history.replaceState({}, "", scopeRoot + window.location.search + window.location.hash);
}

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Missing #root element in HTML document.");
}

createRoot(rootElement).render(
    <BrowserRouter>
        <Root />
    </BrowserRouter>,
);
