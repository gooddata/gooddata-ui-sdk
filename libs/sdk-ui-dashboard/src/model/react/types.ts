// (C) 2021 GoodData Corporation
import { IAnalyticalBackend, IWorkspacePermissions } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { DashboardEventHandler } from "../events/eventHandler";
import { DashboardDispatch, DashboardState } from "../state/types";
import { DashboardConfig } from "../types/commonTypes";

/**
 * @internal
 */
export interface IDashboardStoreProviderProps {
    /**
     * Analytical backend from which the dashboard obtains data to render.
     *
     * If you do not specify instance of analytical backend using this prop, then you MUST have
     * BackendProvider up in the component tree.
     */
    backend?: IAnalyticalBackend;

    /**
     * Identifier of analytical workspace, from which the dashboard obtains data to render.
     *
     * If you do not specify workspace identifier, then you MUST have WorkspaceProvider up in the
     * component tree.
     */
    workspace?: string;

    /**
     * Reference of the persisted dashboard to render.
     */
    dashboardRef?: ObjRef;

    /**
     * Optionally specify event handlers to register at the dashboard creation time.
     *
     * Note: all events that will be emitted during the initial load processing will have the `initialLoad`
     * correlationId.
     *
     * TODO: this needs more attention.
     */
    eventHandlers?: DashboardEventHandler[];

    /**
     * Configuration that can be used to modify dashboard features, capabilities and behavior.
     *
     * If not specified, then the dashboard will retrieve and use the essential configuration from the backend.
     */
    config?: DashboardConfig;

    /**
     * Optionally specify permissions to use when determining availability of the different features of
     * the dashboard component.
     *
     * If you do not specify permissions, the dashboard component will load permissions for the currently
     * logged-in user.
     */
    permissions?: IWorkspacePermissions;

    /**
     * Optionally specify callback that will be called each time the state changes.
     */
    onStateChange?: (state: DashboardState, dispatch: DashboardDispatch) => void;
}
