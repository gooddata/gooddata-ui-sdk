// (C) 2020-2024 GoodData Corporation
import { useCallback } from "react";
import { IWidgetAlert, IWidgetAlertDefinition, ObjRef } from "@gooddata/sdk-model";

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

export const useKpiAlertOperations = (closeAlertDialog: () => void): UseKpiAlertOperations => {
    // Disconnected as we changed the original alert methods for generic insight alerting (KPI is not used in Tiger)
    const [creatingStatus, onCreateAlert] = ["idle" as KpiAlertOperationStatus, closeAlertDialog];
    const [updatingStatus, onUpdateAlert] = ["idle" as KpiAlertOperationStatus, closeAlertDialog];
    const [removingStatus, onRemoveAlerts] = [
        "idle" as KpiAlertOperationStatus,
        (_: ObjRef[]) => closeAlertDialog,
    ];

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
