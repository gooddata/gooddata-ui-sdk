// (C) 2021-2026 GoodData Corporation

import { type Context, type ReactNode } from "react";

import { type ReactReduxContextValue } from "react-redux";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IDashboard, type IWorkspacePermissions, type ObjRef } from "@gooddata/sdk-model";

import { type RenderMode } from "../../types.js";
import { type DashboardEventHandler } from "../eventHandlers/eventHandler.js";
import { type DashboardDispatch, type DashboardState } from "../store/types.js";
import {
    type DashboardConfig,
    type DashboardModelCustomizationFns,
    type WidgetsOverlayFn,
} from "../types/commonTypes.js";

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
    initialTabId?: string;
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
