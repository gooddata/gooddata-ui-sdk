// (C) 2020-2021 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IColorPalette } from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { colorPaletteDataLoaderFactory } from "../../../../dataLoaders";
import { backendInvariant, workspaceInvariant } from "../utils";

interface IUseColorPaletteConfig extends UseCancelablePromiseCallbacks<IColorPalette, GoodDataSdkError> {
    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the hook MUST be called within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace to get the color palette for.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the hook MUST be called within an existing WorkspaceContext.
     */
    workspace?: string;
}

/**
 * Hook allowing to download color palette of the given workspace
 * @param config - configuration of the hook
 * @internal
 */
export function useColorPalette({
    backend,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
    workspace,
}: IUseColorPaletteConfig): UseCancelablePromiseState<IColorPalette, any> {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    backendInvariant(effectiveBackend, "useColorPalette");
    workspaceInvariant(effectiveWorkspace, "useColorPalette");

    const loader = colorPaletteDataLoaderFactory.forWorkspace(effectiveWorkspace);
    const promise = () => loader.getColorPalette(effectiveBackend);

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
    ]);
}
