// (C) 2021 GoodData Corporation
import { useState } from "react";
import { IAnalyticalBackend, IWidgetAlert } from "@gooddata/sdk-backend-spi";
import { useDeleteKpiAlert } from "../../hooks/useDeleteWidgetAlert";
import { KpiAlertOperationStatus } from "../../types";
import { useAlerts } from "../DashboardAlertsContext";

interface IUseAlertDeleteHandlerConfig {
    alert: IWidgetAlert;
    closeAlertDialog: () => void;
    backend: IAnalyticalBackend;
    workspace: string;
}

export function useAlertDeleteHandler({
    alert,
    closeAlertDialog,
    backend,
    workspace,
}: IUseAlertDeleteHandlerConfig): {
    alertDeletingStatus: KpiAlertOperationStatus;
    deleteAlert: () => void;
} {
    const { removeAlert } = useAlerts();
    const [shouldDeleteAlert, setShouldDeleteAlert] = useState(false);
    const deleteAlert = () => setShouldDeleteAlert(true);
    const [alertDeletingStatus, setAlertDeletingStatus] = useState<KpiAlertOperationStatus>("idle");
    useDeleteKpiAlert({
        backend,
        workspace,
        widgetAlert: shouldDeleteAlert ? alert : null,
        onError: () => {
            setAlertDeletingStatus("error");
            setShouldDeleteAlert(false);
        },
        onLoading: () => setAlertDeletingStatus("inProgress"),
        onSuccess: () => {
            setAlertDeletingStatus("idle");
            setShouldDeleteAlert(false);
            closeAlertDialog();
            removeAlert(alert);
        },
    });

    return {
        alertDeletingStatus,
        deleteAlert,
    };
}
