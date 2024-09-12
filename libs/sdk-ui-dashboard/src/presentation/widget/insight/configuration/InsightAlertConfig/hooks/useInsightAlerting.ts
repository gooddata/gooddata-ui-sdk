// (C) 2022-2024 GoodData Corporation
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IInsightWidget,
    isAllTimeDateFilter,
} from "@gooddata/sdk-model";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
    useDashboardSelector,
    selectInsightByWidgetRef,
    selectEntitlementMaxAutomations,
    selectEntitlementUnlimitedAutomations,
    DEFAULT_MAX_AUTOMATIONS,
    selectAutomationsCount,
    selectWebhooks,
    refreshAutomations,
    useDashboardDispatch,
    dispatchAndWaitFor,
    selectAutomationsAlertsInContext,
    selectDashboardId,
    selectSmtps,
    selectLocale,
    selectCanCreateAutomation,
} from "../../../../../../model/index.js";
import { createDefaultAlert, getSupportedInsightMeasuresByInsight } from "../utils.js";
import { messages } from "../messages.js";
import { useWidgetFilters } from "../../../../common/useWidgetFilters.js";
import { useSaveAlertToBackend } from "./useSaveAlertToBackend.js";
import { fillMissingTitles, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

type InsightWidgetAlertingViewMode = "list" | "edit" | "create";

export interface IInsightWidgetAlertingProps {
    widget?: IInsightWidget | undefined;
    closeInsightWidgetMenu: () => void;
}

export const useInsightWidgetAlerting = ({ widget, closeInsightWidgetMenu }: IInsightWidgetAlertingProps) => {
    const { addSuccess, addError } = useToastMessage();
    const dispatch = useDashboardDispatch();
    const effectiveBackend = useBackendStrict();
    const effectiveWorkspace = useWorkspaceStrict();
    const webhooks = useDashboardSelector(selectWebhooks);
    const emails = useDashboardSelector(selectSmtps);
    const alerts = useDashboardSelector(selectAutomationsAlertsInContext(widget?.localIdentifier));
    const dashboard = useDashboardSelector(selectDashboardId);
    const insight = useDashboardSelector(selectInsightByWidgetRef(widget?.ref));
    const automationsCount = useDashboardSelector(selectAutomationsCount);
    const maxAutomationsEntitlement = useDashboardSelector(selectEntitlementMaxAutomations);
    const unlimitedAutomationsEntitlement = useDashboardSelector(selectEntitlementUnlimitedAutomations);
    const canCreateAutomation = useDashboardSelector(selectCanCreateAutomation);

    const { handleCreateAlert, handleUpdateAlert, handlePauseAlert, handleResumeAlert } =
        useSaveAlertToBackend({
            onCreateSuccess: () => {
                setViewMode("list");
                handleRefreshAutomations();
                addSuccess(messages.alertAddSuccess);
            },
            onCreateError: () => {
                setIsLoading(false);
                setViewMode("list");
                addError(messages.alertSaveError);
            },
            onUpdateSuccess: () => {
                cancelAlertEditing();
                handleRefreshAutomations();
                addSuccess(messages.alertUpdateSuccess);
            },
            onUpdateError: () => {
                setIsLoading(false);
                cancelAlertEditing();
                addError(messages.alertSaveError);
            },
            onPauseSuccess: () => {
                handleRefreshAutomations();
                addSuccess(messages.alertPauseSuccess);
            },
            onPauseError: () => {
                setIsLoading(false);
                addError(messages.alertSaveError);
            },
            onResumeSuccess: () => {
                handleRefreshAutomations();
                addSuccess(messages.alertResumeSuccess);
            },
            onResumeError: () => {
                setIsLoading(false);
                addError(messages.alertSaveError);
            },
        });

    const { result: widgetFilters, status: widgetFiltersStatus } = useWidgetFilters(widget, insight);
    const destinations = useMemo(() => [...emails, ...webhooks], [emails, webhooks]);
    const locale = useDashboardSelector(selectLocale);
    const supportedMeasures = useMemo(
        () =>
            getSupportedInsightMeasuresByInsight(
                insight ? fillMissingTitles(insight, locale, 9999) : insight,
            ),
        [insight, locale],
    );
    const defaultMeasure = supportedMeasures[0];
    const defaultNotificationChannelId = destinations[0]?.id;
    const hasAlerts = alerts.length > 0;
    const maxAutomations = parseInt(maxAutomationsEntitlement?.value ?? DEFAULT_MAX_AUTOMATIONS, 10);
    const maxAutomationsReached = automationsCount >= maxAutomations && !unlimitedAutomationsEntitlement;

    // Handle async widget filters state
    useEffect(() => {
        if (supportedMeasures.length === 0) {
            setIsLoading(false);
            return;
        }
        if (widgetFiltersStatus === "success") {
            setIsLoading(false);
            const sanitizedFilters = widgetFilters.filter((filter) => !isAllTimeDateFilter(filter));
            setDefaultAlert(
                createDefaultAlert(sanitizedFilters, defaultMeasure!, defaultNotificationChannelId),
            );
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

    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<InsightWidgetAlertingViewMode>(
        alerts.length > 0 || !canCreateAutomation ? "list" : "create",
    );
    const [defaultAlert, setDefaultAlert] = useState<
        IAutomationMetadataObject | IAutomationMetadataObjectDefinition | null
    >(null);
    const [editingAlert, setEditingAlert] = useState<IAutomationMetadataObject | null>(null);

    const initiateAlertCreation = () => {
        setViewMode("create");
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

    const cancelAlertEditing = () => {
        setEditingAlert(null);
        setViewMode("list");
    };

    const saveNewAlert = (alert: IAutomationMetadataObjectDefinition) => {
        const id = uuidv4();
        const alertToCreate = {
            ...alert,
            id,
            ref: { identifier: id, type: "automation" },
            uri: id,
            dashboard,
            metadata: {
                widget: widget?.localIdentifier,
            },
        } as IAutomationMetadataObject;
        setIsLoading(true);
        handleCreateAlert(alertToCreate);
    };

    const updateExistingAlert = (alert: IAutomationMetadataObject) => {
        setIsLoading(true);
        handleUpdateAlert(alert);
    };

    const pauseExistingAlert = (alert: IAutomationMetadataObject) => {
        const alertToPause = {
            ...alert,
            alert: { ...alert.alert, trigger: { ...alert.alert?.trigger, state: "PAUSED" } },
        } as IAutomationMetadataObject;
        setIsLoading(true);
        handlePauseAlert(alertToPause);
    };

    const resumeExistingAlert = (alert: IAutomationMetadataObject) => {
        const alertToResume = {
            ...alert,
            alert: { ...alert.alert, trigger: { ...alert.alert?.trigger, state: "ACTIVE" } },
        } as IAutomationMetadataObject;
        setIsLoading(true);
        handleResumeAlert(alertToResume);
    };

    const deleteExistingAlert = async (alert: IAutomationMetadataObject) => {
        setIsLoading(true);
        try {
            await effectiveBackend.workspace(effectiveWorkspace).automations().deleteAutomation(alert.id);
            addSuccess(messages.alertDeleteSuccess);
            setViewMode(alerts.length === 1 ? "create" : "list");
            handleRefreshAutomations();
        } catch (err) {
            addError(messages.alertDeleteError);
            setIsLoading(false);
        }
    };

    const handleRefreshAutomations = useCallback(() => {
        setIsLoading(true);
        dispatchAndWaitFor(dispatch, refreshAutomations()).then(() => {
            setIsLoading(false);
        });
    }, [dispatch]);

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
        canCreateAutomation,
    };
};
