// (C) 2020-2021 GoodData Corporation
import { useMemo } from "react";
import { IAnalyticalBackend, ICatalogAttribute, ICatalogDateAttribute } from "@gooddata/sdk-backend-spi";
import {
    GoodDataSdkError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { attributesWithDrillDownDataLoaderFactory } from "../../../../dataLoaders";
import { backendInvariant, workspaceInvariant } from "../utils";

interface IAttributesWithDrillDownConfig
    extends UseCancelablePromiseCallbacks<
        Array<ICatalogAttribute | ICatalogDateAttribute>,
        GoodDataSdkError
    > {
    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the hook MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace to get the color palette for.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the hook MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;

    /**
     * If false, the catalog loading is skipped since nobody cares about the results anyway (no one is handling the drills).
     */
    hasDrillingEnabled?: boolean;
}

/**
 * Hook allowing to download attributes with drillDown of the given workspace
 * @param config - configuration of the hook
 * @internal
 */
export function useAttributesWithDrillDown({
    backend,
    hasDrillingEnabled,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
    workspace,
}: IAttributesWithDrillDownConfig): UseCancelablePromiseState<
    Array<ICatalogAttribute | ICatalogDateAttribute>,
    any
> {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    backendInvariant(effectiveBackend, "useAttributesWithDrillDown");
    workspaceInvariant(effectiveWorkspace, "useAttributesWithDrillDown");

    const promise = useMemo(() => {
        return async () => {
            if (!hasDrillingEnabled) {
                return [];
            }

            const loader = attributesWithDrillDownDataLoaderFactory.forWorkspace(effectiveWorkspace);
            return loader.getAttributesWithDrillDown(effectiveBackend);
        };
    }, [hasDrillingEnabled, effectiveBackend, effectiveWorkspace]);

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
        hasDrillingEnabled,
    ]);
}
