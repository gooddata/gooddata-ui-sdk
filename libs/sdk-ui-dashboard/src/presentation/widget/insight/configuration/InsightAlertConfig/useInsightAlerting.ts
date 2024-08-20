// (C) 2022-2024 GoodData Corporation
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IInsightWidget,
} from "@gooddata/sdk-model";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
    useDashboardSelector,
    selectInsightByWidgetRef,
    selectEntitlementMaxAutomations,
    selectEntitlementUnlimitedAutomations,
    DEFAULT_MAX_AUTOMATIONS,
    selectAutomationsCount,
} from "../../../../../model/index.js";
import { createDefaultAlert, getSupportedInsightMeasuresByInsight } from "./utils.js";
import { INotificationChannel } from "./constants.js";
import { messages } from "./messages.js";
import { useWidgetFilters } from "../../../common/useWidgetFilters.js";

type InsightWidgetAlertingViewMode = "list" | "edit" | "create";

export interface IInsightWidgetAlertingProps {
    widget?: IInsightWidget | null;
    closeInsightWidgetMenu: () => void;
}

export const useInsightWidgetAlerting = ({ widget, closeInsightWidgetMenu }: IInsightWidgetAlertingProps) => {
    const { addSuccess, addError } = useToastMessage();
    const [isLoading, setIsLoading] = useState(true);

    // TODO: load from backend
    const [alerts, setAlerts] = useState<IAutomationMetadataObject[]>([]);
    const hasAlerts = alerts.length > 0;

    // TODO: load from backend
    const destinations: INotificationChannel[] = [
        { id: "email", title: "Email" },
        { id: "webhook", title: "Webhook" },
    ];

    const insight = useDashboardSelector(selectInsightByWidgetRef(widget?.ref));
    const { result: widgetFilters, status: widgetFiltersStatus } = useWidgetFilters(widget, insight);
    const supportedMeasures = getSupportedInsightMeasuresByInsight(insight);
    const defaultMeasure = supportedMeasures[0];
    const defaultNotificationChannelId = destinations[0].id;

    // Handle async widget filters state
    useEffect(() => {
        if (widgetFiltersStatus === "success") {
            setIsLoading(false);
            setDefaultAlert(createDefaultAlert(widgetFilters, defaultMeasure!, defaultNotificationChannelId));
        } else if (widgetFiltersStatus === "error") {
            setIsLoading(false);
            closeInsightWidgetMenu();
            addError(messages.alertLoadingError);
        }
        // Avoid infinite loop by ignoring addError
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        closeInsightWidgetMenu,
        defaultMeasure,
        defaultNotificationChannelId,
        widgetFilters,
        widgetFiltersStatus,
    ]);

    const automationsCount = useDashboardSelector(selectAutomationsCount);
    const maxAutomationsEntitlement = useDashboardSelector(selectEntitlementMaxAutomations);
    const unlimitedAutomationsEntitlement = useDashboardSelector(selectEntitlementUnlimitedAutomations);
    const maxAutomations = parseInt(maxAutomationsEntitlement?.value ?? DEFAULT_MAX_AUTOMATIONS, 10);
    const maxAutomationsReached = automationsCount >= maxAutomations && !unlimitedAutomationsEntitlement;

    const [viewMode, setViewMode] = useState<InsightWidgetAlertingViewMode>(
        alerts.length > 0 ? "list" : "create",
    );

    const [defaultAlert, setDefaultAlert] = useState<
        IAutomationMetadataObject | IAutomationMetadataObjectDefinition | null
    >(null);
    const [editingAlert, setEditingAlert] = useState<IAutomationMetadataObject | null>(null);

    const initiateAlertCreation = () => {
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
            addSuccess(messages.alertAddSuccess);
            return updatedAlerts;
        });
        setViewMode("list");
    };

    const cancelAlertCreation = () => {
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
            addSuccess(messages.alertUpdateSuccess);
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
            addSuccess(messages.alertPauseSuccess);
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
            addSuccess(messages.alertResumeSuccess);
            return updatedAlerts;
        });
    };

    const deleteExistingAlert = (alert: IAutomationMetadataObject) => {
        setAlerts((alertsToUpdate) => {
            const updatedAlerts = alertsToUpdate.filter((a) => a.id !== alert.id);
            if (updatedAlerts.length === 0) {
                closeInsightWidgetMenu();
            }
            addSuccess(messages.alertDeleteSuccess);
            return updatedAlerts;
        });
    };

    return {
        isLoading,
        destinations,
        alerts,
        viewMode,
        editingAlert,
        creatingAlert: defaultAlert,
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
        maxAutomationsReached,
    };
};
