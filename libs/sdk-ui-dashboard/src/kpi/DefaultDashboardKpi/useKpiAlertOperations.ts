// (C) 2020-2021 GoodData Corporation
import { useState } from "react";
import { IWidgetAlertDefinition, IWidgetAlert } from "@gooddata/sdk-backend-spi";
import { useDashboardCommand } from "../../dashboard/useDashboardCommand";
import { createAlert, updateAlert, removeAlert } from "../../model";
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

    const onRemoveAlert = useDashboardCommand(
        removeAlert,
        {
            "GDC.DASH/EVT.ALERT.REMOVED": () => {
                setRemovingStatus("idle");
                closeAlertDialog();
            },
            "GDC.DASH/EVT.COMMAND.FAILED": () => {
                setRemovingStatus("error");
            },
        },
        () => setRemovingStatus("inProgress"),
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
