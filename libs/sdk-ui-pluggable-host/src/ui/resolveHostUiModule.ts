// (C) 2026 GoodData Corporation

import { type IPlatformContext, type IHostUiModule } from "@gooddata/sdk-pluggable-application-model";

import { loadRemoteHostUiModule } from "../loader/remoteLoader.js";
import { getRemoteRegistry } from "../registry/pluggableApplicationsRegistry.js";

import { defaultHostUiModule } from "./DefaultHostUi.js";

/**
 * Resolves the host UI module to use.
 *
 * If the remote pluggable applications registry specifies a `uiModule`, it will be loaded
 * via module federation. Otherwise, the built-in default host UI is used.
 */
export async function resolveHostUiModule(ctx: IPlatformContext): Promise<IHostUiModule> {
    const remoteRegistry = getRemoteRegistry(ctx);

    if (remoteRegistry?.uiModule) {
        try {
            return await loadRemoteHostUiModule(remoteRegistry.uiModule);
        } catch (error) {
            console.error(
                "[host-runtime/resolve-ui] Failed to load remote UI module, falling back to default.",
                error,
            );
        }
    }

    return defaultHostUiModule;
}
