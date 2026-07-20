// (C) 2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo } from "react";

import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import type { ObjectType } from "../objectType/types.js";

import type { AsCodeObjectType, IAsCodeDescriptor, IAsCodeMutationPort } from "./descriptor.js";

type AsCodeMutations = Partial<Record<AsCodeObjectType, IAsCodeMutationPort>>;

const AsCodeMutationContext = createContext<AsCodeMutations | null>(null);

type ProviderProps = PropsWithChildren<{
    /** Descriptors for each as-code capable object type; used to build adapters. */
    descriptors?: Record<AsCodeObjectType, IAsCodeDescriptor>;
    /** Per-type port overrides for tests. */
    ports?: AsCodeMutations;
}>;

/**
 * Builds and provides one mutation port per supplied descriptor. Must be placed inside `BackendProvider`
 * and `WorkspaceProvider`.
 * @internal
 */
export function AsCodeMutationProvider({ children, descriptors, ports }: ProviderProps) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const mutations = useMemo<AsCodeMutations>(() => {
        const built: AsCodeMutations = {};
        // Object.entries widens the key to string; the map's own type guarantees it is an AsCodeObjectType.
        const entries = Object.entries(descriptors ?? {}) as ReadonlyArray<
            [AsCodeObjectType, IAsCodeDescriptor]
        >;
        for (const [type, descriptor] of entries) {
            built[type] = descriptor.createMutationPort(backend, workspace);
        }
        return { ...built, ...ports };
    }, [backend, workspace, descriptors, ports]);
    return <AsCodeMutationContext.Provider value={mutations}>{children}</AsCodeMutationContext.Provider>;
}

/**
 * The mutation port for one as-code type. Throws for a non-as-code type (a caller should only reach
 * this via a resolved descriptor) or when the provider is missing.
 * @internal
 */
export function useAsCodePort(type: ObjectType): IAsCodeMutationPort {
    const mutations = useContext(AsCodeMutationContext);
    if (!mutations) {
        throw new Error("useAsCodePort must be used within AsCodeMutationProvider");
    }
    const port = mutations[type as AsCodeObjectType];
    if (!port) {
        throw new Error(`No as-code mutation port is registered for object type "${type}".`);
    }
    return port;
}
