// (C) 2026 GoodData Corporation

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-kit/styles/css/indigoFont.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { type ILocalPluggableApplicationsRegistryV1 } from "@gooddata/sdk-model";
import { type IPluggableApp } from "@gooddata/sdk-pluggable-application-model";
import {
    Root,
    registerLocalApplicationLoaders,
    registerLocalApplications,
    registerLocalHostUiModuleLoader,
} from "@gooddata/sdk-ui-pluggable-host";

// The host renders this module in place of its default header, navigation and layout.
registerLocalHostUiModuleLoader(() => import("gdc-host-ui-template-name-module"));

// Sample applications give the navigation something to show. The organization's registry adds its
// own applications on top of these.
function createSampleApp(title: string): IPluggableApp {
    return {
        mount({ container, ctx }) {
            const render = (workspaceId: string | undefined) => {
                container.textContent = workspaceId ? `${title} — workspace ${workspaceId}` : title;
            };
            render(ctx.currentWorkspaceId);
            return {
                unmount() {
                    container.textContent = "";
                },
                updateContext(nextCtx) {
                    render(nextCtx.currentWorkspaceId);
                },
            };
        },
    };
}

const localApplications: ILocalPluggableApplicationsRegistryV1 = {
    apiVersion: "1.0",
    applications: [
        {
            apiVersion: "1.0",
            id: "harness-organization-app",
            applicationScope: "organization",
            menuOrder: 1,
            title: "Sample organization app",
            local: { routeBase: "/sample" },
        },
        {
            apiVersion: "1.0",
            id: "harness-workspace-app",
            applicationScope: "workspace",
            menuOrder: 2,
            title: "Sample workspace app",
            local: { routeBase: "/sample" },
        },
    ],
};

registerLocalApplications(localApplications);
registerLocalApplicationLoaders({
    "harness-organization-app": () =>
        Promise.resolve({ pluggableApp: createSampleApp("Sample organization app") }),
    "harness-workspace-app": () => Promise.resolve({ pluggableApp: createSampleApp("Sample workspace app") }),
});

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Missing #root element in HTML document.");
}

createRoot(rootElement).render(
    <BrowserRouter>
        <Root />
    </BrowserRouter>,
);
