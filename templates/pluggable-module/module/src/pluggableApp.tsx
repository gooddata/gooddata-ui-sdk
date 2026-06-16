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
import { PluggableAppTelemetryProvider } from "@gooddata/sdk-ui-pluggable-application";

import { App } from "./App.js";
import { AppProviders } from "./AppProviders.js";

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

        return {
            unmount() {
                root.unmount();
            },
            updateContext(nextCtx: IPlatformContext) {
                renderApp(root, nextCtx, basePath, onEvent, onTelemetryEvent);
            },
        };
    },
};
