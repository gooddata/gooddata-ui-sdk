// (C) 2019-2022 GoodData Corporation
import React from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useBackendStrict } from "../BackendContext.js";
import {
    useCancelablePromise,
    UseCancelablePromiseState,
    UseCancelablePromiseStatus,
} from "../useCancelablePromise.js";
import { GoodDataSdkError } from "../../errors/GoodDataSdkError.js";
import isEmpty from "lodash/isEmpty.js";
import { resolveLCMWorkspaceIdentifiers } from "./resolveLCMWorkspaceIdentifiers.js";
import { IClientWorkspaceIdentifiers, IClientWorkspaceStatus } from "./interfaces.js";
import { useWorkspace, WorkspaceProvider } from "../WorkspaceContext.js";
import { invariant } from "ts-invariant";

/**
 * @alpha
 */
export type IClientWorkspaceContext = UseCancelablePromiseState<
    IClientWorkspaceIdentifiers,
    GoodDataSdkError
> &
    IClientWorkspaceStatus;

const ClientWorkspaceContext = React.createContext<IClientWorkspaceContext>({
    status: "pending",
    error: undefined,
    result: undefined,
    isInitialized: false,
});
ClientWorkspaceContext.displayName = "ClientWorkspace";

/**
 * Common props of the {@link ClientWorkspaceProvider}.
 *
 * @alpha
 */
export interface IClientWorkspaceProviderCoreProps {
    /**
     * Specify an instance of the analytical backend instance to work with.
     *
     * @remarks
     * Note: if you do not have a BackendProvider above in the component tree, then you MUST specify the backend.
     */
    backend?: IAnalyticalBackend;

    /**
     * Wrapped React components that will have access to the LCMWorkspace context.
     */
    children: React.ReactNode;
}

/**
 * @alpha
 */
export interface IClientWorkspaceProviderWithWorkspaceProps extends IClientWorkspaceProviderCoreProps {
    /**
     * Specify the workspace to use to obtain the LCM context.
     *
     * @remarks
     * Note: another option is to specify dataProduct and client props, and then workspace will be resolved from them.
     */
    workspace: string;
}

/**
 * @alpha
 */
export interface IClientWorkspaceProviderWithClientAndDataProductProps
    extends IClientWorkspaceProviderCoreProps {
    /**
     * Specify the data product identifier to use to obtain the LCM context.
     *
     * @remarks
     * Note: another option is to specify workspace prop, and then data product identifier will be resolved from it.
     */
    dataProduct: string;

    /**
     * Specify the client identifier to use to obtain the LCM context.
     *
     * Note: another option is to specify workspace prop, and then client identifier will be resolved from it.
     */
    client: string;
}

/**
 * Props of the {@link ClientWorkspaceProvider} component.
 * @alpha
 */
export type IClientWorkspaceProviderProps =
    | IClientWorkspaceProviderWithWorkspaceProps
    | IClientWorkspaceProviderWithClientAndDataProductProps;

/**
 * ClientWorkspaceProvider can be used as a replacement of the {@link WorkspaceProvider},
 * if you want to work with the workspace in LCM context.
 *
 * It allows you to:
 * - Use dataProduct and client identifier as a replacement of the workspace identifier.
 *   Workspace identifier is resolved and provided to the {@link WorkspaceProvider} automatically.
 *
 * - Use workspace identifier to obtain dataProduct, client and segment identifiers by the {@link useClientWorkspaceIdentifiers} hooks.
 *
 * If the backend does not support clientId / dataProduct LCM provisioning,
 * or the workspace is not provisioned via LCM, segment / client / dataProduct values will be undefined.
 *
 * To read more details about LCM, see: {@link https://help.gooddata.com/pages/viewpage.action?pageId=86796865}
 *
 * @alpha
 */
export const ClientWorkspaceProvider: React.FC<IClientWorkspaceProviderProps> = (props) => {
    const { children, backend: customBackend } = props;
    const { client, dataProduct, workspace: customWorkspace } = getInputLCMIdentifiersFromProps(props);
    const backend = useBackendStrict(customBackend, "ClientWorkspaceProvider");
    const workspace = useWorkspace(customWorkspace);

    const lcmIdentifiers = useCancelablePromise(
        {
            promise: () => resolveLCMWorkspaceIdentifiers(backend, { client, dataProduct, workspace }),
        },
        [client, dataProduct, workspace, backend],
    );

    const ws = lcmIdentifiers.result?.workspace;

    return (
        <ClientWorkspaceContext.Provider value={{ ...lcmIdentifiers, isInitialized: true }}>
            <WorkspaceProvider workspace={ws!}>{children}</WorkspaceProvider>
        </ClientWorkspaceContext.Provider>
    );
};

/**
 * ResolvedClientWorkspaceProvider can be used as a replacement of the {@link WorkspaceProvider}, if you are accessing
 * workspace in LCM context.
 *
 * This provider expects that the client workspace is already resolved on input to the provider. The provider
 * will then establish a client workspace and workspace contexts so that the resolved information can
 * be accessed by the children.
 *
 * Note: check out the {@link ClientWorkspaceProvider} for version of provider that performs the resolution of
 * client workspace identifiers to workspace.
 *
 * @alpha
 */
export const ResolvedClientWorkspaceProvider: React.FC<IClientWorkspaceIdentifiers> = (props) => {
    invariant(props.dataProduct);
    invariant(props.client);
    invariant(props.workspace);

    const context: IClientWorkspaceContext = {
        status: "success",
        result: props,
        error: undefined,
        isInitialized: true,
    };

    return (
        <ClientWorkspaceContext.Provider value={context}>
            <WorkspaceProvider workspace={props.workspace}>{props.children}</WorkspaceProvider>
        </ClientWorkspaceContext.Provider>
    );
};

/**
 * Hook to obtain loading status of the {@link ClientWorkspaceProvider} - "success", "error", "loading" or "pending".
 * @alpha
 */
export const useClientWorkspaceStatus = (): UseCancelablePromiseStatus => {
    const context = React.useContext(ClientWorkspaceContext);
    return context.status;
};

/**
 * Hook to obtain loading error of the {@link ClientWorkspaceProvider}.
 * @alpha
 */
export const useClientWorkspaceError = (): GoodDataSdkError | undefined => {
    const context = React.useContext(ClientWorkspaceContext);
    return context.error;
};

/**
 * Hook to obtain all resolved identifiers from the {@link ClientWorkspaceProvider} - workspace, segment, dataProduct and client.
 * @alpha
 */
export const useClientWorkspaceIdentifiers = (): IClientWorkspaceIdentifiers => {
    const context = React.useContext(ClientWorkspaceContext);
    return context.result ?? {};
};

/**
 * Hook to check if client workspace is initialized.
 *
 * @alpha
 */
export const useClientWorkspaceInitialized = (): boolean => {
    const context = React.useContext(ClientWorkspaceContext);
    return context.isInitialized;
};

//
//
//

function hasWorkspaceProp<T>(obj: T): obj is T & { workspace: string } {
    return !isEmpty(obj) && !!(obj as Record<string, any>).workspace;
}

function getInputLCMIdentifiersFromProps(props: IClientWorkspaceProviderProps): IClientWorkspaceIdentifiers {
    if (hasWorkspaceProp(props)) {
        return {
            workspace: props.workspace,
        };
    }

    invariant(
        props.client && props.dataProduct,
        "ClientWorkspaceProvider: You must specify either - the workspace identifier, or the client and dataProduct identifier.",
    );
    return {
        client: props.client,
        dataProduct: props.dataProduct,
    };
}
