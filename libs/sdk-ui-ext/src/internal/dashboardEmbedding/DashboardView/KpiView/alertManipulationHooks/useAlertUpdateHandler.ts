// (C) 2021 GoodData Corporation
import { useState } from "react";
import { IAnalyticalBackend, IWidgetAlert } from "@gooddata/sdk-backend-spi";
import { useUpdateWidgetAlert } from "../../../hooks/useUpdateWidgetAlert";
import { KpiAlertOperationStatus } from "../../../types";
import { useAlerts } from "../../DashboardAlertsContext";

interface IUseAlertUpdateHandlerConfig {
    closeAlertDialog: () => void;
    backend: IAnalyticalBackend;
    workspace: string;
}

export function useAlertUpdateHandler({
    closeAlertDialog,
    backend,
    workspace,
}: IUseAlertUpdateHandlerConfig): {
    alertUpdatingStatus: KpiAlertOperationStatus;
    updateAlert: (alert: IWidgetAlert) => void;
} {
    const { updateAlert: updateAlertInAlerts } = useAlerts();
    const [alertToUpdate, setAlertToUpdate] = useState<IWidgetAlert | undefined>();
    const updateAlert = (alert: IWidgetAlert) => setAlertToUpdate(alert);
    const [alertUpdatingStatus, setAlertUpdatingStatus] = useState<KpiAlertOperationStatus>("idle");
    useUpdateWidgetAlert({
        backend,
        workspace,
        widgetAlert: alertToUpdate,
        onError: () => {
            setAlertUpdatingStatus("error");
            setAlertToUpdate(undefined);
        },
        onLoading: () => setAlertUpdatingStatus("inProgress"),
        onSuccess: (saved) => {
            setAlertUpdatingStatus("idle");
            updateAlertInAlerts(saved);
            setAlertToUpdate(undefined);
            closeAlertDialog();
        },
    });

    return {
        alertUpdatingStatus,
        updateAlert,
    };
}
