// (C) 2021-2025 GoodData Corporation

import { Context, ReactNode } from "react";

import { ReactReduxContextValue } from "react-redux";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IDashboard, IWorkspacePermissions, ObjRef } from "@gooddata/sdk-model";

import { RenderMode } from "../../types.js";
import { DashboardEventHandler } from "../eventHandlers/eventHandler.js";
import { DashboardDispatch, DashboardState } from "../store/index.js";
import { DashboardConfig, DashboardModelCustomizationFns, WidgetsOverlayFn } from "../types/commonTypes.js";

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
    additionalReduxContext?: Context<ReactReduxContextValue | null>;
    customizationFns?: DashboardModelCustomizationFns;
    widgetsOverlayFn?: WidgetsOverlayFn;
    initialRenderMode?: RenderMode;
    children?: ReactNode;
}
