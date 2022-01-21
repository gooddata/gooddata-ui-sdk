// (C) 2021 GoodData Corporation
import { useEffect, useRef, useState } from "react";
import { useBackendStrict, useClientWorkspaceIdentifiers, usePrevious, useWorkspace } from "@gooddata/sdk-ui";
import { IAnalyticalBackend, IDashboard, IDashboardWidget, isDashboard } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { objectUtils } from "@gooddata/util";
import { IDashboardStoreProviderProps } from "./types";
import { newRenderingWorker } from "../commandHandlers/render/renderingWorker";
import { DashboardEventHandler } from "../eventHandlers/eventHandler";
import { initializeDashboard, InitialLoadCorrelationId } from "../commands";
import { createDashboardStore, ReduxedDashboardStore } from "../store/dashboardStore";
import { dashboardDeinitialized } from "../events/dashboard";

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
    const { dashboard } = props;
    const backend = useBackendStrict(props.backend);
    const workspace = useWorkspace(props.workspace);
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
                dashboardStore.rootSagaTask.cancel();
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
                    preloadedDashboard: isDashboard(dashboard) ? dashboard : undefined,
                },
            });
            newDashboardStore.store.dispatch(
                initializeDashboard(props.config, props.permissions, InitialLoadCorrelationId),
            );
            setDashboardStore(newDashboardStore);
        }
    });

    return dashboardStore;
};
