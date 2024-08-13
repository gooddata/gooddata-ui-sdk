// (C) 2022-2024 GoodData Corporation
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IFilter,
    IInsightWidget,
} from "@gooddata/sdk-model";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDashboardSelector, selectInsightByWidgetRef } from "../../../../../model/index.js";
import { createDefaultAlert, getSupportedInsightMeasuresByInsight } from "./utils.js";
import { INotificationChannel } from "./constants.js";
// import { useWidgetFilters } from "../../../common/useWidgetFilters.js";

type InsightWidgetAlertingViewMode = "list" | "edit" | "create";

export interface IInsightWidgetAlertingProps {
    widget: IInsightWidget;
    closeInsightWidgetMenu: () => void;
}

export const useInsightWidgetAlerting = ({ widget, closeInsightWidgetMenu }: IInsightWidgetAlertingProps) => {
    const { addSuccess } = useToastMessage();

    // TODO: load from backend
    const [alerts, setAlerts] = useState<IAutomationMetadataObject[]>([]);
    const hasAlerts = alerts.length > 0;

    // TODO: load from backend
    const destinations: INotificationChannel[] = [
        { id: "email", title: "Email" },
        { id: "webhook", title: "Webhook" },
    ];

    // TODO: load from backend
    const widgetFilters: IFilter[] = [];
    // const widgetFilters = useWidgetFilters(widget, insight);

    const insight = useDashboardSelector(selectInsightByWidgetRef(widget.ref))!;
    const supportedMeasures = getSupportedInsightMeasuresByInsight(insight);
    const defaultMeasure = supportedMeasures[0];
    const defaultNotificationChannelId = destinations[0].id;
    const defaultAlert = createDefaultAlert(widgetFilters, defaultMeasure!, defaultNotificationChannelId);

    const [viewMode, setViewMode] = useState<InsightWidgetAlertingViewMode>(
        alerts.length > 0 ? "list" : "create",
    );
    const [editingAlert, setEditingAlert] = useState<IAutomationMetadataObject | null>(null);
    const [creatingAlert, setCreatingAlert] = useState<IAutomationMetadataObjectDefinition>(defaultAlert);

    const initiateAlertCreation = () => {
        setCreatingAlert(defaultAlert);
        setViewMode("create");
    };

    const saveNewAlert = (alert: IAutomationMetadataObjectDefinition) => {
        const id = uuidv4();
        setAlerts((alertsToUpdate) => {
            const updatedAlerts = [
                ...alertsToUpdate,
                {
                    ...alert,
                    id,
                    ref: { identifier: id, type: "automation" },
                    uri: id,
                } as IAutomationMetadataObject,
            ];
            addSuccess({ id: "Success. The alert has been added." });
            return updatedAlerts;
        });
        setCreatingAlert(defaultAlert);
        setViewMode("list");
    };

    const cancelAlertCreation = () => {
        setCreatingAlert(defaultAlert);
        if (hasAlerts) {
            setViewMode("list");
        } else {
            closeInsightWidgetMenu();
        }
    };

    const initiateAlertEditing = (alert: IAutomationMetadataObject) => {
        setEditingAlert(alert);
        setViewMode("edit");
    };

    const updateExistingAlert = (alert: IAutomationMetadataObject) => {
        setAlerts((alertsToUpdate) => {
            const updatedAlerts = alertsToUpdate.map((a) => (a.id === alert.id ? alert : a));
            addSuccess({ id: "Success. The alert has been updated." });
            return updatedAlerts;
        });
        cancelAlertEditing();
    };

    const cancelAlertEditing = () => {
        setEditingAlert(null);
        setViewMode("list");
    };

    const pauseExistingAlert = (alert: IAutomationMetadataObject) => {
        setAlerts((alertsToUpdate) => {
            const updatedAlerts = alertsToUpdate.map((a) =>
                a.id === alert.id
                    ? ({
                          ...a,
                          alert: { ...a.alert, trigger: { ...a.alert?.trigger, state: "PAUSED" } },
                      } as IAutomationMetadataObject)
                    : a,
            );
            addSuccess({ id: "Success. The alert has been paused." });
            return updatedAlerts;
        });
    };

    const resumeExistingAlert = (alert: IAutomationMetadataObject) => {
        setAlerts((alertsToUpdate) => {
            const updatedAlerts = alertsToUpdate.map((a) =>
                a.id === alert.id
                    ? ({
                          ...a,
                          alert: { ...a.alert, trigger: { ...a.alert?.trigger, state: "ACTIVE" } },
                      } as IAutomationMetadataObject)
                    : a,
            );
            addSuccess({ id: "Success. The alert has been resumed." });
            return updatedAlerts;
        });
    };

    const deleteExistingAlert = (alert: IAutomationMetadataObject) => {
        setAlerts((alertsToUpdate) => {
            const updatedAlerts = alertsToUpdate.filter((a) => a.id !== alert.id);
            if (updatedAlerts.length === 0) {
                closeInsightWidgetMenu();
            }
            addSuccess({ id: "Success. The alert has been deleted." });
            return updatedAlerts;
        });
    };

    return {
        destinations,
        alerts,
        viewMode,
        editingAlert,
        creatingAlert,
        initiateAlertCreation,
        initiateAlertEditing,
        updateExistingAlert,
        saveNewAlert,
        pauseExistingAlert,
        resumeExistingAlert,
        deleteExistingAlert,
        cancelAlertEditing,
        cancelAlertCreation,
        hasAlerts,
        supportedMeasures,
    };
};
