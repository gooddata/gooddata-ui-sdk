// (C) 2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo } from "react";

import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { type IParameterMutationPort, createParameterMutationAdapter } from "./parameterMutationPort.js";

const ParameterMutationContext = createContext<IParameterMutationPort | null>(null);

type ProviderProps = PropsWithChildren<{
    port?: IParameterMutationPort;
}>;

/**
 * Must be placed inside `BackendProvider` and `WorkspaceProvider`.
 * @internal
 */
export function ParameterMutationProvider({ children, port }: ProviderProps) {
    if (port) {
        return <ParameterMutationContext.Provider value={port}>{children}</ParameterMutationContext.Provider>;
    }
    return <DefaultParameterMutationProvider>{children}</DefaultParameterMutationProvider>;
}

/**
 * @internal
 */
export function useParameterMutation(): IParameterMutationPort {
    const mutation = useContext(ParameterMutationContext);
    if (!mutation) {
        throw new Error("useParameterMutation must be used within ParameterMutationProvider");
    }
    return mutation;
}

function DefaultParameterMutationProvider({ children }: PropsWithChildren) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const mutation = useMemo(() => createParameterMutationAdapter(backend, workspace), [backend, workspace]);
    return <ParameterMutationContext.Provider value={mutation}>{children}</ParameterMutationContext.Provider>;
}
