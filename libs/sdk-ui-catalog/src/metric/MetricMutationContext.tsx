// (C) 2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo } from "react";

import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { type IMetricMutationPort, createMetricMutationAdapter } from "./metricMutationPort.js";

const MetricMutationContext = createContext<IMetricMutationPort | null>(null);

type ProviderProps = PropsWithChildren<{
    port?: IMetricMutationPort;
}>;

/**
 * Must be placed inside `BackendProvider` and `WorkspaceProvider`.
 * @internal
 */
export function MetricMutationProvider({ children, port }: ProviderProps) {
    if (port) {
        return <MetricMutationContext.Provider value={port}>{children}</MetricMutationContext.Provider>;
    }
    return <DefaultMetricMutationProvider>{children}</DefaultMetricMutationProvider>;
}

/**
 * @internal
 */
export function useMetricMutation(): IMetricMutationPort {
    const mutation = useContext(MetricMutationContext);
    if (!mutation) {
        throw new Error("useMetricMutation must be used within MetricMutationProvider");
    }
    return mutation;
}

function DefaultMetricMutationProvider({ children }: PropsWithChildren) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const mutation = useMemo(() => createMetricMutationAdapter(backend, workspace), [backend, workspace]);
    return <MetricMutationContext.Provider value={mutation}>{children}</MetricMutationContext.Provider>;
}
