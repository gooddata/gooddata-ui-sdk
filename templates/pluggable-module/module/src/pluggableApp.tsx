// (C) 2026 GoodData Corporation

import { createRoot, type Root } from "react-dom/client";

import {
    type IPluggableApp,
    type IPluggableApplicationMountHandle,
    type IPluggableApplicationMountOptions,
    type IPluggableAppEvent,
    type IPluggableAppTelemetryCallbacks,
    type IPlatformContext,
} from "@gooddata/sdk-pluggable-application-model";

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
            <App onEvent={onEvent} onTelemetryEvent={onTelemetryEvent} />
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
