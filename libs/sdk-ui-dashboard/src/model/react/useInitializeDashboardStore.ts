// (C) 2021-2022 GoodData Corporation
import { useEffect, useRef, useState } from "react";
import { useBackendStrict, useClientWorkspaceIdentifiers, usePrevious, useWorkspace } from "@gooddata/sdk-ui";
import { useMapboxToken, enrichMapboxToken } from "@gooddata/sdk-ui-geo";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ObjRef, IDashboardWidget, IDashboard, isDashboard } from "@gooddata/sdk-model";
import { objectUtils } from "@gooddata/util";
import { IDashboardStoreProviderProps } from "./types.js";
import { newRenderingWorker } from "../commandHandlers/render/renderingWorker.js";
import { DashboardEventHandler } from "../eventHandlers/eventHandler.js";
import { initializeDashboardWithPersistedDashboard, InitialLoadCorrelationId } from "../commands/index.js";
import { createDashboardStore, ReduxedDashboardStore } from "../store/dashboardStore.js";
import { dashboardDeinitialized } from "../events/dashboard.js";

type InitProps = {
    backend: IAnalyticalBackend;
    workspace: string | undefined;
    dashboard: ObjRef | IDashboard<IDashboardWidget> | undefined;
    filterContextRef: ObjRef | undefined;
    clientId: string | undefined;
    dataProductId: string | undefined;
    initialEventHandlers: DashboardEventHandler[] | undefined;
};

function dispatchDeinitialized(dashboardStore: ReduxedDashboardStore | null, initProps: InitProps): void {
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
        ),
    );
}

function useNotifyDeinitializedOnUnmount(
    dashboardStore: ReduxedDashboardStore | null,
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

/**
 * This hook is responsible for properly initializing and re-initializing the dashboard redux store,
 * when the props of the Dashboard component change.
 * It also cancels currently running sagas before the re-initialization.
 *
 * @internal
 */
export const useInitializeDashboardStore = (
    props: IDashboardStoreProviderProps,
): ReduxedDashboardStore | null => {
    const { dashboard, persistedDashboard } = props;
    const backend = useBackendStrict(props.backend);
    const workspace = useWorkspace(props.workspace);
    const mapboxToken = useMapboxToken(props.config?.mapboxToken);
    const { client: clientId, dataProduct: dataProductId } = useClientWorkspaceIdentifiers() ?? {};
    const [dashboardStore, setDashboardStore] = useState<ReduxedDashboardStore | null>(null);
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

    useEffect(() => {
        if (!objectUtils.shallowEqualObjects(previousInitProps, currentInitProps) || !dashboardStore) {
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

            const backgroundWorkers = [newRenderingWorker()];

            // Create new store and fire load dashboard command.
            const newDashboardStore = createDashboardStore({
                dashboardContext: {
                    backend,
                    workspace: workspace!,
                    dashboardRef: dashboardRef,
                    filterContextRef: currentInitProps.filterContextRef,
                    clientId: currentInitProps.clientId,
                    dataProductId: currentInitProps.dataProductId,
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
                    enrichMapboxToken(props.config, mapboxToken),
                    props.permissions,
                    persistedDashboard,
                    InitialLoadCorrelationId,
                ),
            );
            setDashboardStore(newDashboardStore);
        }
    });

    return dashboardStore;
};
