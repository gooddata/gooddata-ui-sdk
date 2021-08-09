// (C) 2021 GoodData Corporation
import { useEffect, useState } from "react";
import { usePrevious } from "@gooddata/sdk-ui";
import { createDashboardStore, ReduxedDashboardStore } from "../state/dashboardStore";
import { InitialLoadCorrelationId, loadDashboard } from "../commands/dashboard";
import { objectUtils } from "@gooddata/util";
import { IDashboardStoreProviderProps } from "./types";
import { newRenderingWorker } from "../commandHandlers/render/renderingWorker";
import { useDashboardContext } from "./DashboardContextContext";

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
    const [dashboardStore, setDashboardStore] = useState<ReduxedDashboardStore | null>(null);
    const dashboardContext = useDashboardContext();

    const currentInitProps = {
        ...dashboardContext,
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
                sagaContext: dashboardContext,
                initialEventHandlers: props.eventHandlers,
                backgroundWorkers,
            });
            dashStore.store.dispatch(
                loadDashboard(props.config, props.permissions, InitialLoadCorrelationId),
            );
            return setDashboardStore(dashStore);
        }
    });

    return dashboardStore;
};
