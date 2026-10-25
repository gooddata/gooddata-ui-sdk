// (C) 2023-2026 GoodData Corporation

import { useEffect, useRef, useState } from "react";

import { type IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";
import {
    type UseCancelablePromiseState,
    useBackend,
    useCancelablePromise,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { type IMultipleMetricsProps, type IPrefixes } from "@gooddata/sdk-ui-metric-component";

export function usePrefixes(metrics: IMultipleMetricsProps["metrics"]): IPrefixes | null {
    const { result } = useWorkspaceDescriptor(metrics);
    const [prefixes, setPrefixes] = useState<IPrefixes | null>(null);

    useEffect(() => {
        if (!result || prefixes) {
            return;
        }
        setPrefixes(buildPrefixes(result));
    }, [result, prefixes]);

    return prefixes;
}

function useWorkspaceDescriptor(
    metrics: IMultipleMetricsProps["metrics"],
): UseCancelablePromiseState<IWorkspaceDescriptor | undefined, Error> {
    const workspaceId = useWorkspace();
    const backend = useBackend();
    const descriptors = useRef<Promise<IWorkspaceDescriptor>>(null);

    const promise = () => {
        if (workspaceId && backend && metrics.length > 0) {
            const includeParentPrefixes = true;
            descriptors.current =
                descriptors.current || backend.workspace(workspaceId).getDescriptor(includeParentPrefixes);
            return descriptors.current;
        }
        return Promise.resolve(undefined);
    };

    return useCancelablePromise({ promise }, [backend, workspaceId, metrics.length]);
}

function buildPrefixes(result: IWorkspaceDescriptor): IPrefixes {
    return {
        current: result.prefix,
        parents: result.parentPrefixes ?? [],
    };
}
