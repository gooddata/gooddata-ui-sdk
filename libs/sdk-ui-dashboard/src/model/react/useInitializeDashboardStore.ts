// (C) 2021-2026 GoodData Corporation

import { useEffect, useRef, useState } from "react";

import { type Action } from "@reduxjs/toolkit";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IDashboard, type IDashboardWidget, type ObjRef, isDashboard } from "@gooddata/sdk-model";
import { useBackendStrict, useClientWorkspaceIdentifiers, usePrevious, useWorkspace } from "@gooddata/sdk-ui";
import { enrichMapboxToken, useMapboxToken } from "@gooddata/sdk-ui-geo";
import { enrichAgGridToken, useAgGridToken } from "@gooddata/sdk-ui-pivot/next";
import { shallowEqualObjects } from "@gooddata/util";

import { type IDashboardStoreProviderProps } from "./types.js";
import { newRenderingWorker } from "../commandHandlers/render/renderingWorker.js";
import {
    InitialLoadCorrelationId,
    initializeDashboardWithPersistedDashboard,
} from "../commands/dashboard.js";
import { type DashboardEventHandler } from "../eventHandlers/eventHandler.js";
import { dashboardDeinitialized } from "../events/dashboard.js";
import { type IReduxedDashboardStore, createDashboardStore } from "../store/dashboardStore.js";
import { getWidgetsOfType } from "../store/tabs/layout/layoutUtils.js";
import type { DashboardConfig } from "../types/commonTypes.js";

type InitProps = {
    backend: IAnalyticalBackend;
    workspace: string | undefined;
    dashboard: ObjRef | IDashboard<IDashboardWidget> | undefined;
    filterContextRef: ObjRef | undefined;
    clientId: string | undefined;
    dataProductId: string | undefined;
    initialEventHandlers: DashboardEventHandler[] | undefined;
};

function dispatchDeinitialized(dashboardStore: IReduxedDashboardStore | null, initProps: InitProps): void {
    const dashboardRef = isDashboard(initProps.dashboard) ? initProps.dashboard.ref : initProps.dashboard;
    dashboardStore?.store.dispatch(
        dashboardDeinitialized(
            {
                backend: initProps.backend,
                workspace: initProps.workspace!,
                dashboardRef,
                filterContextRef: initProps.filterContextRef,
                clientId: initProps.clientId,
                dataProductId: initProps.dataProductId,
            },
            dashboardRef,
        ) as Action,
    );
}

function useNotifyDeinitializedOnUnmount(
    dashboardStore: IReduxedDashboardStore | null,
    initProps: InitProps,
): void {
    // we need to keep these in refs to be able to access them from the "componentDidUnmount" effect
    // otherwise, by the time we get to that effect these would be null
    const dashboardStoreRef = useRef(dashboardStore);
    const initPropsRef = useRef(initProps);

    useEffect(() => {
        dashboardStoreRef.current = dashboardStore;
        initPropsRef.current = initProps;
    });

    useEffect(() => {
        return () => {
            dispatchDeinitialized(dashboardStoreRef.current, initPropsRef.current);
        };
    }, []);
}

function enrichConfig(
    config: DashboardConfig | undefined,
    mapboxToken?: string,
    agGridToken?: string,
): DashboardConfig | undefined {
    const withMapbox = (cfg?: DashboardConfig) => enrichMapboxToken(cfg, mapboxToken);
    const withAgGrid = (cfg?: DashboardConfig) => enrichAgGridToken(cfg, agGridToken);

    return withAgGrid(withMapbox(config));
}

/**
 * This hook is responsible for properly initializing and re-initializing the dashboard redux store,
 * when the props of the Dashboard component change.
 * It also cancels currently running sagas before the re-initialization.
 *
 * @internal
 */
export const useInitializeDashboardStore = (
    props: IDashboardStoreProviderProps,
): IReduxedDashboardStore | null => {
    const { dashboard, persistedDashboard, config } = props;
    const backend = useBackendStrict(props.backend);
    const workspace = useWorkspace(props.workspace);
    const mapboxToken = useMapboxToken(props.config?.mapboxToken);
    const agGridToken = useAgGridToken(props.config?.agGridToken);
    const { client: clientId, dataProduct: dataProductId } = useClientWorkspaceIdentifiers() ?? {};
    const [dashboardStore, setDashboardStore] = useState<IReduxedDashboardStore | null>(null);
    const dashboardRef = isDashboard(dashboard) ? dashboard.ref : dashboard;
    const currentInitProps: InitProps = {
        backend,
        workspace,
        dashboard,
        filterContextRef: props.filterContextRef,
        clientId,
        dataProductId,
        initialEventHandlers: props.eventHandlers,
    };
    const previousInitProps = usePrevious(currentInitProps);

    useNotifyDeinitializedOnUnmount(dashboardStore, currentInitProps);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!shallowEqualObjects(previousInitProps, currentInitProps) || !dashboardStore) {
            if (dashboardStore) {
                // Trigger the deinitialize event, we are going to initialize a whole ne store right away
                // Use the previousInitProps: we want to notify the dashboard being discarded, not the new one.
                dispatchDeinitialized(dashboardStore, previousInitProps);

                // When props are different and dashboardStore is already initialized or initializing,
                // cancel all running sagas.
                // In some cases (eg., re-initialization caused by a call from the event handler),
                // this can lead to an error, but it should be safe to ignore it.
                try {
                    dashboardStore.rootSagaTask.cancel();
                    // eslint-disable-next-line no-empty
                } catch {}
            }

            let asyncRenderExpectedCount = undefined;
            if (isDashboard(dashboard) && dashboard.layout !== undefined && !dashboard.plugins) {
                asyncRenderExpectedCount = getWidgetsOfType(dashboard.layout, [
                    "kpi",
                    "insight",
                    "visualizationSwitcher",
                ]).length;
            }
            const backgroundWorkers = [
                newRenderingWorker({
                    asyncRenderExpectedCount,
                    isExport: config?.isExport,
                }),
            ];

            // Create new store and fire load dashboard command.
            const newDashboardStore = createDashboardStore({
                dashboardContext: {
                    backend,
                    workspace: workspace!,
                    dashboardRef: dashboardRef,
                    filterContextRef: currentInitProps.filterContextRef,
                    clientId: currentInitProps.clientId,
                    dataProductId: currentInitProps.dataProductId,
                    config,
                },
                eventing: {
                    initialEventHandlers: props.eventHandlers,
                    onStateChange: props.onStateChange,
                    onEventingInitialized: props.onEventingInitialized,
                },
                backgroundWorkers,
                privateContext: {
                    ...props.customizationFns,
                    widgetsOverlayFn: props.widgetsOverlayFn,
                    preloadedDashboard: isDashboard(dashboard) ? dashboard : undefined,
                },
                initialRenderMode: props.initialRenderMode ?? "view",
            });
            newDashboardStore.store.dispatch(
                initializeDashboardWithPersistedDashboard(
                    enrichConfig(props.config, mapboxToken, agGridToken),
                    props.permissions,
                    persistedDashboard,
                    InitialLoadCorrelationId,
                    props.initialTabId,
                ) as Action,
            );
            setDashboardStore(newDashboardStore);
        }
    });

    return dashboardStore;
};
