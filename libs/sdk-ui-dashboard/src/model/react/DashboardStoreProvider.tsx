// (C) 2021 GoodData Corporation
import React from "react";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { createDispatchHook, createSelectorHook, Provider, TypedUseSelectorHook } from "react-redux";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { DashboardEventHandler } from "../events/eventHandler";
import { createDashboardStore } from "../state/dashboardStore";
import { DashboardState } from "../state/types";

import { DashboardEventsProvider } from "./DashboardEventsContext";

/**
 * @internal
 */
export const ReactDashboardContext: any = React.createContext(null);

/**
 * @internal
 */
export const useDashboardDispatch: () => Dispatch<AnyAction> = createDispatchHook(ReactDashboardContext);

/**
 * @internal
 */
export const useDashboardSelector: TypedUseSelectorHook<DashboardState> =
    createSelectorHook(ReactDashboardContext);

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
    dashboardRef: ObjRef;

    /**
     * Data product identifier.
     * This property is required, if the current backend implementation allows usage of data product identifier
     * and data product identifier is set (workspace is provisioned via LCM).
     *
     * It's used to resolve drill to custom url data product identifier parameter.
     * For more details, see: {@link https://help.gooddata.com/pages/viewpage.action?pageId=86794855}
     */
    dataProductId?: string;

    /**
     * Client identifier.
     * This property is required, if current backend implementation allows usage of client identifier
     * and client identifier is set (workspace is provisioned via LCM).
     *
     * It's used to resolve drill to custom url client identifier parameter.
     * For more details, see: {@link https://help.gooddata.com/pages/viewpage.action?pageId=86794855}
     */
    clientId?: string;

    /**
     * Optionally specify event handlers to register at the dashboard creation time.
     *
     * Note: all events that will be emitted during the initial load processing will have the `initialLoad`
     * correlationId.
     *
     * TODO: this needs more attention.
     */
    eventHandlers?: DashboardEventHandler[];
}

/**
 * @internal
 */
export const DashboardStoreProvider: React.FC<IDashboardStoreProviderProps> = (props) => {
    const backend = useBackendStrict(props.backend);
    const workspace = useWorkspaceStrict(props.workspace);
    const dashboardStore = createDashboardStore({
        sagaContext: {
            backend,
            workspace,
            dashboardRef: props.dashboardRef,
            clientId: props.clientId,
            dataProductId: props.dataProductId,
        },
        initialEventHandlers: props.eventHandlers,
    });

    return (
        <Provider store={dashboardStore.store} context={ReactDashboardContext}>
            <DashboardEventsProvider
                registerHandler={dashboardStore.registerEventHandler}
                unregisterHandler={dashboardStore.unregisterEventHandler}
            >
                {props.children}
            </DashboardEventsProvider>
        </Provider>
    );
};
