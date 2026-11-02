// (C) 2026 GoodData Corporation

import { type PluginOption } from "vite";

/**
 * `@vitejs/plugin-react`, loaded on demand so this entry can be imported for its other parts and
 * plugins by a package that does not install it.
 */
export async function reactPlugin(): Promise<PluginOption> {
    const { default: react } = await import("@vitejs/plugin-react");

    return react();
}
