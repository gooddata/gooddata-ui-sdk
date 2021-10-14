// (C) 2021 GoodData Corporation
import { useEffect, useState } from "react";
import { useBackendStrict, useClientWorkspaceIdentifiers, usePrevious, useWorkspace } from "@gooddata/sdk-ui";
import { objectUtils } from "@gooddata/util";
import { IDashboardStoreProviderProps } from "./types";
import { newRenderingWorker } from "../commandHandlers/render/renderingWorker";
import { initializeDashboard, InitialLoadCorrelationId } from "../commands";
import { createDashboardStore, ReduxedDashboardStore } from "../store/dashboardStore";
import { isDashboard } from "@gooddata/sdk-backend-spi";

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
    const currentInitProps = {
        backend,
        workspace,
        dashboard,
        clientId,
        dataProductId,
        initialEventHandlers: props.eventHandlers,
    };

    const previousInitProps = usePrevious(currentInitProps);

    useEffect(() => {
        if (!objectUtils.shallowEqualObjects(previousInitProps, currentInitProps) || !dashboardStore) {
            if (dashboardStore) {
                // When props are different and dashboardStore is already initialized or initializing,
                // cancel all running sagas.
                dashboardStore.rootSagaTask.cancel();
            }

            const backgroundWorkers = [newRenderingWorker()];

            // Create new store and fire load dashboard command.
            const dashStore = createDashboardStore({
                dashboardContext: {
                    backend,
                    workspace: workspace!,
                    dashboardRef: dashboardRef,
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
            dashStore.store.dispatch(
                initializeDashboard(props.config, props.permissions, InitialLoadCorrelationId),
            );
            return setDashboardStore(dashStore);
        }
    });

    return dashboardStore;
};
