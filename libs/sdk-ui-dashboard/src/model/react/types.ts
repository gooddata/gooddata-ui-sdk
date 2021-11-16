// (C) 2021 GoodData Corporation
import { IAnalyticalBackend, IDashboard, IWorkspacePermissions } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { DashboardEventHandler } from "../eventHandlers/eventHandler";
import { DashboardDispatch, DashboardState } from "../store";
import { DashboardStore } from "../store/dashboardStore";
import { DashboardConfig, DashboardModelCustomizationFns } from "../types/commonTypes";

/**
 * Subset of IDashboardProps required during initialization of the dashboard component's store.
 *
 * @internal
 */
export interface IDashboardStoreProviderProps {
    backend?: IAnalyticalBackend;
    workspace?: string;
    dashboard?: ObjRef | IDashboard;
    filterContextRef?: ObjRef;
    eventHandlers?: DashboardEventHandler[];
    config?: DashboardConfig;
    permissions?: IWorkspacePermissions;
    onStateChange?: (state: DashboardState, dispatch: DashboardDispatch) => void;
    onEventingInitialized?: (
        registerEventHandler: (handler: DashboardEventHandler) => void,
        unregisterEventHandler: (handler: DashboardEventHandler) => void,
    ) => void;
    /**
     * @internal
     */
    onStoreCreated?: (store: DashboardStore) => void;
    customizationFns?: DashboardModelCustomizationFns;
}
