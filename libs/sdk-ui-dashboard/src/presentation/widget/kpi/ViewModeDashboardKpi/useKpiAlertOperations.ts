// (C) 2020-2022 GoodData Corporation
import { useCallback, useState } from "react";
import { IWidgetAlert, IWidgetAlertDefinition } from "@gooddata/sdk-model";

import {
    createAlert,
    updateAlert,
    removeAlerts,
    dispatchAndWaitFor,
    useDashboardDispatch,
    DashboardCommands,
} from "../../../../model/index.js";

import { KpiAlertOperationStatus } from "../common/index.js";

/**
 * @internal
 */
interface UseKpiAlertOperations {
    onCreateAlert: (alert: IWidgetAlertDefinition) => void;
    creatingStatus: KpiAlertOperationStatus;
    onUpdateAlert: (alert: IWidgetAlert) => void;
    updatingStatus: KpiAlertOperationStatus;
    onRemoveAlert: (alert: IWidgetAlert) => void;
    removingStatus: KpiAlertOperationStatus;
}

function useKpiAlertOperation<TCommand extends DashboardCommands, TArgs extends any[]>(
    commandCreator: (...args: TArgs) => TCommand,
    onSuccess: () => void,
): [status: KpiAlertOperationStatus, run: (...args: TArgs) => void] {
    const [status, setStatus] = useState<KpiAlertOperationStatus>("idle");
    const dispatch = useDashboardDispatch();

    const run = useCallback(
        (...args: Parameters<typeof commandCreator>) => {
            setStatus("inProgress");
            dispatchAndWaitFor(dispatch, commandCreator(...args))
                .then(() => {
                    setStatus("idle");
                    onSuccess();
                })
                .catch(() => setStatus("error"));
        },
        [onSuccess],
    );

    return [status, run];
}

export const useKpiAlertOperations = (closeAlertDialog: () => void): UseKpiAlertOperations => {
    const [creatingStatus, onCreateAlert] = useKpiAlertOperation(createAlert, closeAlertDialog);
    const [updatingStatus, onUpdateAlert] = useKpiAlertOperation(updateAlert, closeAlertDialog);
    const [removingStatus, onRemoveAlerts] = useKpiAlertOperation(removeAlerts, closeAlertDialog);

    const onRemoveAlert = useCallback(
        (alert: IWidgetAlert) => {
            onRemoveAlerts([alert.ref]);
        },
        [onRemoveAlerts],
    );

    return {
        onCreateAlert,
        creatingStatus,
        onUpdateAlert,
        updatingStatus,
        onRemoveAlert,
        removingStatus,
    };
};
