// (C) 2026 GoodData Corporation

import type { ModuleFederationOptions } from "@module-federation/vite";
import { type PluginOption } from "vite";

/**
 * What a pluggable module exposes to its hosts. Part of the frozen host contract, with the
 * `remoteEntry.js` filename and the container name.
 */
export const DEFAULT_EXPOSES: Record<string, string> = {
    "./pluggableApp": "./src/pluggableApp.tsx",
};

/**
 * Options for {@link federationRemote}.
 */
export interface IFederationRemoteOptions {
    /**
     * Container name the hosts load the remote by. A frozen contract: hosts hardcode it.
     */
    name: string;

    /**
     * Exposed modules. Defaults to {@link DEFAULT_EXPOSES}.
     */
    exposes?: Record<string, string>;

    /**
     * Further `@module-federation/vite` options merged over the remote defaults, e.g. `shared` and
     * `shareStrategy` for a remote that populates the share scope.
     */
    options?: Partial<ModuleFederationOptions>;
}

/**
 * The Module Federation remote plugin for a pluggable module. `@module-federation/vite` is loaded on
 * demand so this entry can be imported by packages that do not install it.
 */
export async function federationRemote({
    name,
    exposes = DEFAULT_EXPOSES,
    options = {},
}: IFederationRemoteOptions): Promise<PluginOption> {
    const { federation } = await import("@module-federation/vite");

    return federation({
        name,
        filename: "remoteEntry.js",
        manifest: true,
        publicPath: "auto",
        dts: false,
        exposes,
        // Vite shares every dependency by default; share nothing unless the module says otherwise.
        shared: [],
        // Idle-based timeout instead of the default 10s absolute deadline, which flakes on loaded CI
        // runners when the transform is slow but progressing.
        moduleParseIdleTimeout: 60,
        ...options,
    });
}
