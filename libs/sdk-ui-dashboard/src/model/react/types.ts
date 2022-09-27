// (C) 2021-2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ObjRef, IDashboard, IWorkspacePermissions } from "@gooddata/sdk-model";
import { DashboardEventHandler } from "../eventHandlers/eventHandler";
import { DashboardDispatch, DashboardState } from "../store";
import { DashboardConfig, DashboardModelCustomizationFns } from "../types/commonTypes";
import React from "react";
import { ReactReduxContextValue } from "react-redux";
import { RenderMode } from "../../types";

/**
 * Subset of IDashboardProps required during initialization of the dashboard component's store.
 *
 * @internal
 */
export interface IDashboardStoreProviderProps {
    backend?: IAnalyticalBackend;
    workspace?: string;
    dashboard?: ObjRef | IDashboard;
    persistedDashboard?: IDashboard;
    filterContextRef?: ObjRef;
    eventHandlers?: DashboardEventHandler[];
    config?: DashboardConfig;
    permissions?: IWorkspacePermissions;
    onStateChange?: (state: DashboardState, dispatch: DashboardDispatch) => void;
    onEventingInitialized?: (
        registerEventHandler: (handler: DashboardEventHandler) => void,
        unregisterEventHandler: (handler: DashboardEventHandler) => void,
    ) => void;
    additionalReduxContext?: React.Context<ReactReduxContextValue>;
    customizationFns?: DashboardModelCustomizationFns;
    initialRenderMode?: RenderMode;
}
