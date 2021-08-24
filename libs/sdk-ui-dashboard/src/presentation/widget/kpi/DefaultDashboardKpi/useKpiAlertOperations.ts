// (C) 2020-2021 GoodData Corporation
import { useCallback, useState } from "react";
import { IWidgetAlertDefinition, IWidgetAlert } from "@gooddata/sdk-backend-spi";

import { createAlert, updateAlert, removeAlerts, useDashboardCommand } from "../../../../model";

import { KpiAlertOperationStatus } from "./types";

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
    const [creatingStatus, setCreatingStatus] = useState<KpiAlertOperationStatus>("idle");
    const [updatingStatus, setUpdatingStatus] = useState<KpiAlertOperationStatus>("idle");
    const [removingStatus, setRemovingStatus] = useState<KpiAlertOperationStatus>("idle");

    const onCreateAlert = useDashboardCommand(
        createAlert,
        {
            "GDC.DASH/EVT.ALERT.CREATED": () => {
                setCreatingStatus("idle");
                closeAlertDialog();
            },
            "GDC.DASH/EVT.COMMAND.FAILED": () => {
                setCreatingStatus("error");
            },
        },
        () => setCreatingStatus("inProgress"),
    );

    const onUpdateAlert = useDashboardCommand(
        updateAlert,
        {
            "GDC.DASH/EVT.ALERT.UPDATED": () => {
                setUpdatingStatus("idle");
                closeAlertDialog();
            },
            "GDC.DASH/EVT.COMMAND.FAILED": () => {
                setUpdatingStatus("error");
            },
        },
        () => setUpdatingStatus("inProgress"),
    );

    const onRemoveAlerts = useDashboardCommand(
        removeAlerts,
        {
            "GDC.DASH/EVT.ALERTS.REMOVED": () => {
                setRemovingStatus("idle");
                closeAlertDialog();
            },
            "GDC.DASH/EVT.COMMAND.FAILED": () => {
                setRemovingStatus("error");
            },
        },
        () => setRemovingStatus("inProgress"),
    );

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
