// (C) 2026 GoodData Corporation

import { type IHostUiModule } from "@gooddata/sdk-pluggable-application-model";

import { asHostUiModule } from "../loader/remoteLoader.js";

/**
 * @alpha
 */
export type LocalHostUiModuleLoader = () => Promise<{
    default?: IHostUiModule | unknown;
    hostUiModule?: IHostUiModule;
}>;

let registeredLoader: LocalHostUiModuleLoader | undefined;

/**
 * Registers the loader of a local host UI module. Called by the host or a harness before rendering.
 *
 * @remarks
 * A registered local host UI module takes precedence over the `uiModule` of the remote registry.
 * Pass `undefined` to remove the registration.
 *
 * @alpha
 */
export function registerLocalHostUiModuleLoader(loader: LocalHostUiModuleLoader | undefined): void {
    registeredLoader = loader;
}

export async function loadLocalHostUiModule(): Promise<IHostUiModule | undefined> {
    if (!registeredLoader) {
        return undefined;
    }
    const loaded = await registeredLoader();
    return asHostUiModule("Local UI module", {
        hostUiModule: loaded.hostUiModule,
        default: loaded.default as IHostUiModule | undefined,
    });
}
