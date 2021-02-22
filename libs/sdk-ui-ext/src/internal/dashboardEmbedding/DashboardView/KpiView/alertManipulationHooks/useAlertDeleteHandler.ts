// (C) 2021 GoodData Corporation
import { useState } from "react";
import { IWidgetAlert } from "@gooddata/sdk-backend-spi";
import { useDeleteWidgetAlert } from "../../../hooks/useDeleteWidgetAlert";
import { KpiAlertOperationStatus } from "../../../types";
import { useAlerts } from "../../contexts";
import { IUseAlertManipulationHandlerConfig } from "./types";

export function useAlertDeleteHandler({
    closeAlertDialog,
    backend,
    workspace,
}: IUseAlertManipulationHandlerConfig): {
    alertDeletingStatus: KpiAlertOperationStatus;
    deleteAlert: (alert: IWidgetAlert) => void;
} {
    const { removeAlert } = useAlerts();
    const [alertToDelete, setAlertToDelete] = useState<IWidgetAlert | undefined>(undefined);
    const deleteAlert = (alert: IWidgetAlert) => setAlertToDelete(alert);
    const [alertDeletingStatus, setAlertDeletingStatus] = useState<KpiAlertOperationStatus>("idle");
    useDeleteWidgetAlert({
        backend,
        workspace,
        widgetAlert: alertToDelete,
        onError: () => {
            setAlertDeletingStatus("error");
            setAlertToDelete(undefined);
        },
        onLoading: () => setAlertDeletingStatus("inProgress"),
        onSuccess: () => {
            setAlertDeletingStatus("idle");
            removeAlert(alertToDelete);
            setAlertToDelete(undefined);
            closeAlertDialog();
        },
    });

    return {
        alertDeletingStatus,
        deleteAlert,
    };
}
