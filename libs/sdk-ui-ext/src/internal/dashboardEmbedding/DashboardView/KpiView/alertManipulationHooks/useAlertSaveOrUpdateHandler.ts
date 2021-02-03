// (C) 2021 GoodData Corporation
import { useState } from "react";
import { IAnalyticalBackend, isWidgetAlert, IWidgetAlertDefinition } from "@gooddata/sdk-backend-spi";
import { useSaveOrUpdateWidgetAlert } from "../../../hooks/useSaveOrUpdateWidgetAlert";
import { KpiAlertOperationStatus } from "../../../types";
import { useAlerts } from "../../DashboardAlertsContext";

interface IUseAlertSaveHandlerConfig {
    closeAlertDialog: () => void;
    backend: IAnalyticalBackend;
    workspace: string;
}

export function useAlertSaveOrUpdateHandler({
    closeAlertDialog,
    backend,
    workspace,
}: IUseAlertSaveHandlerConfig): {
    alertSavingStatus: KpiAlertOperationStatus;
    saveOrUpdateAlert: (alert: IWidgetAlertDefinition) => void;
} {
    const { addAlert, updateAlert } = useAlerts();
    const [alertToSave, setAlertToSave] = useState<IWidgetAlertDefinition | undefined>();
    const saveOrUpdateAlert = (alert: IWidgetAlertDefinition) => setAlertToSave(alert);
    const [alertSavingStatus, setAlertSavingStatus] = useState<KpiAlertOperationStatus>("idle");
    useSaveOrUpdateWidgetAlert({
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

            const wasUpdate = isWidgetAlert(alertToSave);
            if (wasUpdate) {
                updateAlert(saved);
            } else {
                addAlert(saved);
            }

            setAlertToSave(undefined);
            closeAlertDialog();
        },
    });

    return {
        alertSavingStatus,
        saveOrUpdateAlert,
    };
}
