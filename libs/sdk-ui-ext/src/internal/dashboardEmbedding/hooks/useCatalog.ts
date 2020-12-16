// (C) 2020 GoodData Corporation
import {
    IAnalyticalBackend,
    IWorkspaceCatalog,
    IWorkspaceCatalogFactoryOptions,
} from "@gooddata/sdk-backend-spi";
import {
    GoodDataSdkError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspace,
} from "@gooddata/sdk-ui";
import invariant from "ts-invariant";

/**
 * @beta
 */
export interface IUseCatalogConfig
    extends UseCancelablePromiseCallbacks<IWorkspaceCatalog, GoodDataSdkError> {
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
     * Additional options passed to the catalog request.
     */
    catalogOptions?: Partial<IWorkspaceCatalogFactoryOptions>;
}

/**
 * Hook allowing to download catalog of the given workspace
 * @param config - configuration of the hook
 * @beta
 */
export function useCatalog({
    backend,
    catalogOptions = {},
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
    workspace,
}: IUseCatalogConfig): UseCancelablePromiseState<IWorkspaceCatalog, any> {
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

    const promise = () =>
        effectiveBackend.workspace(effectiveWorkspace).catalog().withOptions(catalogOptions).load();

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
        catalogOptions,
    ]);
}
