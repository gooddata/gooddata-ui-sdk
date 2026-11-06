// (C) 2026 GoodData Corporation

import { type IHeadlessModule } from "@gooddata/sdk-pluggable-application-model";

import { asHeadlessModule } from "../loader/remoteLoader.js";

/**
 * @alpha
 */
export type LocalHeadlessModuleLoader = () => Promise<{
    default?: IHeadlessModule | unknown;
    headlessModule?: IHeadlessModule;
}>;

let registeredLoaders: Record<string, LocalHeadlessModuleLoader> = {};

/**
 * Registers the loaders of local headless modules, keyed by module id. Called by the host or a
 * harness before rendering.
 *
 * @alpha
 */
export function registerLocalHeadlessModuleLoaders(loaders: Record<string, LocalHeadlessModuleLoader>): void {
    registeredLoaders = loaders;
}

export async function loadLocalHeadlessModule(moduleId: string): Promise<IHeadlessModule> {
    const loader = registeredLoaders[moduleId];
    if (!loader) {
        throw new Error(`[host-runtime/local-loader] Unknown local headless module "${moduleId}".`);
    }
    const loaded = await loader();
    return asHeadlessModule(`Local module "${moduleId}"`, {
        headlessModule: loaded.headlessModule,
        default: loaded.default as IHeadlessModule | undefined,
    });
}
