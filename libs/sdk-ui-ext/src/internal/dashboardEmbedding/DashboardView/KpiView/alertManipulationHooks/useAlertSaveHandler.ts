// (C) 2021 GoodData Corporation
import { useState } from "react";
import { IAnalyticalBackend, IWidgetAlertDefinition } from "@gooddata/sdk-backend-spi";
import { useSaveWidgetAlert } from "../../../hooks/useSaveWidgetAlert";
import { KpiAlertOperationStatus } from "../../../types";
import { useAlerts } from "../../DashboardAlertsContext";

interface IUseAlertSaveHandlerConfig {
    closeAlertDialog: () => void;
    backend: IAnalyticalBackend;
    workspace: string;
}

export function useAlertSaveHandler({
    closeAlertDialog,
    backend,
    workspace,
}: IUseAlertSaveHandlerConfig): {
    alertSavingStatus: KpiAlertOperationStatus;
    saveAlert: (alert: IWidgetAlertDefinition) => void;
} {
    const { addAlert } = useAlerts();
    const [alertToSave, setAlertToSave] = useState<IWidgetAlertDefinition | undefined>();
    const saveAlert = (alert: IWidgetAlertDefinition) => setAlertToSave(alert);
    const [alertSavingStatus, setAlertSavingStatus] = useState<KpiAlertOperationStatus>("idle");
    useSaveWidgetAlert({
        backend,
        workspace,
        widgetAlert: alertToSave,
        onError: () => {
            setAlertSavingStatus("error");
            setAlertToSave(undefined);
        },
        onLoading: () => setAlertSavingStatus("inProgress"),
        onSuccess: (saved) => {
            setAlertSavingStatus("idle");
            addAlert(saved);
            setAlertToSave(undefined);
            closeAlertDialog();
        },
    });

    return {
        alertSavingStatus,
        saveAlert,
    };
}
