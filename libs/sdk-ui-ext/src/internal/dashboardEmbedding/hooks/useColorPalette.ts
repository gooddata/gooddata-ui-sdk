// (C) 2020 GoodData Corporation
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
import invariant from "ts-invariant";
import { getDashboardViewDataLoader } from "./dataLoaders";

/**
 * @beta
 */
export interface IUseColorPaletteConfig
    extends UseCancelablePromiseCallbacks<IColorPalette, GoodDataSdkError> {
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
 * @beta
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

    invariant(
        effectiveBackend,
        "The backend in useColorPalette must be defined. Either pass it as a config prop or make sure there is a BackendProvider up the component tree.",
    );

    invariant(
        effectiveWorkspace,
        "The workspace in useColorPalette must be defined. Either pass it as a config prop or make sure there is a WorkspaceProvider up the component tree.",
    );

    const loader = getDashboardViewDataLoader(effectiveWorkspace);
    const promise = () => loader.getColorPalette(effectiveBackend);

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
    ]);
}
