// (C) 2021 GoodData Corporation
import { IWorkspacePermissions } from "@gooddata/sdk-backend-spi";
import { DashboardEventHandler } from "../events/eventHandler";
import { DashboardConfig } from "../types/commonTypes";

/**
 * @internal
 */
export interface IDashboardStoreProviderProps {
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
}
