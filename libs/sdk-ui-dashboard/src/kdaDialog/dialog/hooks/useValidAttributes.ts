// (C) 2025 GoodData Corporation

import { useEffect } from "react";

import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { useKdaState } from "../../providers/KdaState.js";
import { IKdaDefinition } from "../../types.js";

export function useValidAttributes() {
    const { state, setState } = useKdaState();
    const definition = state.definition;

    const { result, status } = useValidObjectsResults(definition);

    useEffect(() => {
        setState({
            relevantAttributes: result ?? [],
            relevantStatus: status,
        });
    }, [result, setState, status]);
}

function useValidObjectsResults(definition: IKdaDefinition | null) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const metric = definition?.metric;
    const metrics = definition?.metrics;

    return useCancelablePromise(
        {
            promise: () => {
                if (!metric) {
                    return Promise.resolve(undefined);
                }
                return backend.workspace(workspace).measures().getConnectedAttributes(metric, metrics);
            },
        },
        [],
    );
}
