// (C) 2021 GoodData Corporation
import { useEffect, useState } from "react";
import { usePrevious, useWorkspace } from "@gooddata/sdk-ui";
import { createDashboardStore, ReduxedDashboardStore } from "../state/dashboardStore";
import { InitialLoadCorrelationId, loadDashboard } from "../commands/dashboard";
import { useBackendStrict, useClientWorkspaceIdentifiers } from "@gooddata/sdk-ui";
import { objectUtils } from "@gooddata/util";
import { IDashboardStoreProviderProps } from "./types";
import { requestAsyncRenderForExportRootSaga } from "../commandHandlers/export/requestAsyncRenderForExportRootSaga";

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
    const { dashboardRef } = props;
    const backend = useBackendStrict(props.backend);
    const workspace = useWorkspace(props.workspace);
    const { client: clientId, dataProduct: dataProductId } = useClientWorkspaceIdentifiers() ?? {};
    const [dashboardStore, setDashboardStore] = useState<ReduxedDashboardStore | null>(null);

    const currentInitProps = {
        backend,
        workspace,
        dashboardRef,
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

            const backgroundWorkers = [];

            if (props.config?.isExport) {
                backgroundWorkers.push(requestAsyncRenderForExportRootSaga);
            }

            // Create new store and fire load dashboard command.
            const dashStore = createDashboardStore({
                sagaContext: {
                    backend,
                    workspace: workspace!,
                    dashboardRef: currentInitProps.dashboardRef,
                    clientId: currentInitProps.clientId,
                    dataProductId: currentInitProps.dataProductId,
                },
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
