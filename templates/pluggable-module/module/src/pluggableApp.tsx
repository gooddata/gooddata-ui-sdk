// (C) 2026 GoodData Corporation

import { version as moduleReactVersion } from "react";

import { type Root, createRoot } from "react-dom/client";

import {
    type IPlatformContext,
    type IPluggableApp,
    type IPluggableAppEvent,
    type IPluggableAppTelemetryCallbacks,
    type IPluggableApplicationMountHandle,
    type IPluggableApplicationMountOptions,
    LIB_VERSION as moduleSdkVersion,
} from "@gooddata/sdk-pluggable-application-model";
import {
    PluggableAppTelemetryProvider,
    enrichTelemetryCallbacks,
} from "@gooddata/sdk-ui-pluggable-application";

import { App } from "./App.js";
import { AppProviders } from "./AppProviders.js";

// Page id reported on mount. The scaffolder rewrites the `gdc-app-template-name` token to your
// module's id when generating the project, so this becomes your app's name automatically — rename
// it if you want a different page id.
const TELEMETRY_PAGE = "gdc-app-template-name";

/**
 * Report one page view stamped with this module's React / SDK versions — the page-scoped custom
 * variables the host records as `moduleReactVersion` / `moduleSdkVersion`, so a single page view per
 * lifecycle is enough to attribute the module's runtime.
 *
 * Fired here from the mount lifecycle rather than from a React effect inside `<App/>`: AppProviders
 * briefly unmounts its children while an async locale bundle loads, so an effect-based page view
 * would re-fire on that remount. The workspace id (when this app is workspace-scoped) rides along as
 * a neutral `identifiers` entry so the host keeps the page view's workspace attribution.
 */
export function reportPageView(
    onTelemetryEvent: IPluggableAppTelemetryCallbacks | undefined,
    workspaceId: string | undefined,
) {
    const telemetry = enrichTelemetryCallbacks(onTelemetryEvent, { moduleReactVersion, moduleSdkVersion });
    telemetry?.trackPageView(TELEMETRY_PAGE, workspaceId ? { identifiers: { workspaceId } } : undefined);
}

function renderApp(
    root: Root,
    ctx: IPlatformContext,
    _basePath: string,
    onEvent: ((e: IPluggableAppEvent) => void) | undefined,
    onTelemetryEvent: IPluggableAppTelemetryCallbacks | undefined,
) {
    root.render(
        <AppProviders ctx={ctx}>
            <PluggableAppTelemetryProvider
                onTelemetryEvent={onTelemetryEvent}
                moduleReactVersion={moduleReactVersion}
                moduleSdkVersion={moduleSdkVersion}
            >
                <App onEvent={onEvent} />
            </PluggableAppTelemetryProvider>
        </AppProviders>,
    );
}

export const pluggableApp: IPluggableApp = {
    mount({
        container,
        ctx,
        basePath,
        onEvent,
        onTelemetryEvent,
    }: IPluggableApplicationMountOptions): IPluggableApplicationMountHandle {
        // To customize the host header (e.g. add app-specific help menu items),
        // destructure `onHeaderChange` from the mount options and call:
        //   onHeaderChange?.({ helpMenuItems: [...] });
        // See modules/gdc-catalog/module/src/pluggableApp.tsx for a working example.
        const root = createRoot(container);

        renderApp(root, ctx, basePath, onEvent, onTelemetryEvent);
        reportPageView(onTelemetryEvent, ctx.currentWorkspaceId);

        let previousWorkspaceId = ctx.currentWorkspaceId;

        return {
            unmount() {
                root.unmount();
            },
            updateContext(nextCtx: IPlatformContext) {
                renderApp(root, nextCtx, basePath, onEvent, onTelemetryEvent);
                // Re-report only on a genuine workspace switch — not on every context update (theme,
                // auth, locale, …) — so each workspace visit is counted exactly once.
                if (nextCtx.currentWorkspaceId !== previousWorkspaceId) {
                    reportPageView(onTelemetryEvent, nextCtx.currentWorkspaceId);
                    previousWorkspaceId = nextCtx.currentWorkspaceId;
                }
            },
        };
    },
};
