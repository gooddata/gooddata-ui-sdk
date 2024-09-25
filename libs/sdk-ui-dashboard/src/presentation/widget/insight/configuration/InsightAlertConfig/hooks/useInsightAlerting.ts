// (C) 2022-2024 GoodData Corporation
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IInsightWidget,
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
    selectCurrentUser,
    useFiltersForWidgetScheduledExport,
} from "../../../../../../model/index.js";
import { createDefaultAlert, getSupportedInsightMeasuresByInsight } from "../utils.js";
import { messages } from "../messages.js";
import { useSaveAlertToBackend } from "./useSaveAlertToBackend.js";
import { fillMissingTitles, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { convertUserToAutomationRecipient } from "../../../../../../_staging/automation/index.js";
import { useMetricsAndFacts } from "../../../../../../_staging/sharedHooks/useMetricsAndFacts.js";

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
    const currentUser = useDashboardSelector(selectCurrentUser);

    const { handleCreateAlert, handleUpdateAlert, handlePauseAlert, handleResumeAlert, isSavingAlert } =
        useSaveAlertToBackend({
            onCreateSuccess: () => {
                setViewMode("list");
                handleRefreshAutomations();
                addSuccess(messages.alertAddSuccess);
            },
            onCreateError: () => {
                setViewMode("list");
                addError(messages.alertSaveError);
            },
            onUpdateSuccess: () => {
                cancelAlertEditing();
                handleRefreshAutomations();
                addSuccess(messages.alertUpdateSuccess);
            },
            onUpdateError: () => {
                cancelAlertEditing();
                addError(messages.alertSaveError);
            },
            onPauseSuccess: () => {
                handleRefreshAutomations();
                addSuccess(messages.alertPauseSuccess);
            },
            onPauseError: () => {
                addError(messages.alertSaveError);
            },
            onResumeSuccess: () => {
                handleRefreshAutomations();
                addSuccess(messages.alertResumeSuccess);
            },
            onResumeError: () => {
                addError(messages.alertSaveError);
            },
        });

    const { result: widgetFilters, status: widgetFiltersStatus } = useFiltersForWidgetScheduledExport({
        widget,
        insight,
    });
    const { metricsAndFacts, metricsAndFactsLoading, metricsAndFactsLoadingError } = useMetricsAndFacts();

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
    const [isRefreshingAutomations, setIsRefreshingAutomations] = useState(false);
    const [isDeletingAlert, setIsDeletingAlert] = useState(false);
    const isLoadingFilters = widgetFiltersStatus === "pending" || widgetFiltersStatus === "running";
    const [viewMode, setViewMode] = useState<InsightWidgetAlertingViewMode>(
        alerts.length > 0 || !canCreateAutomation ? "list" : "create",
    );
    const [defaultAlert, setDefaultAlert] = useState<
        IAutomationMetadataObject | IAutomationMetadataObjectDefinition | null
    >(null);
    const [editingAlert, setEditingAlert] = useState<IAutomationMetadataObject | null>(null);

    // Handle async widget filters and catalog state
    useEffect(() => {
        if (
            widgetFiltersStatus === "success" &&
            defaultMeasure &&
            defaultNotificationChannelId &&
            !metricsAndFactsLoading &&
            !defaultAlert
        ) {
            setDefaultAlert(
                createDefaultAlert(
                    widgetFilters,
                    defaultMeasure,
                    defaultNotificationChannelId,
                    metricsAndFacts?.metrics ?? [],
                ),
            );
        } else if ((widgetFiltersStatus === "error" || metricsAndFactsLoadingError) && !defaultAlert) {
            closeInsightWidgetMenu();
            addError(messages.alertLoadingError);
        }
        // Avoid infinite loop by ignoring addError
        // /eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        closeInsightWidgetMenu,
        defaultAlert,
        defaultMeasure,
        defaultNotificationChannelId,
        widgetFilters,
        widgetFiltersStatus,
        metricsAndFacts,
        metricsAndFactsLoading,
        metricsAndFactsLoadingError,
        addError,
    ]);

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
            details: {
                ...alert.details,
                widgetName: widget?.title ?? "",
            },
            recipients: [convertUserToAutomationRecipient(currentUser)],
        } as IAutomationMetadataObject;
        handleCreateAlert(alertToCreate);
    };

    const updateExistingAlert = (alert: IAutomationMetadataObject) => {
        handleUpdateAlert(alert);
    };

    const pauseExistingAlert = (alert: IAutomationMetadataObject) => {
        const alertToPause = {
            ...alert,
            alert: { ...alert.alert, trigger: { ...alert.alert?.trigger, state: "PAUSED" } },
        } as IAutomationMetadataObject;
        handlePauseAlert(alertToPause);
    };

    const resumeExistingAlert = (alert: IAutomationMetadataObject) => {
        const alertToResume = {
            ...alert,
            alert: { ...alert.alert, trigger: { ...alert.alert?.trigger, state: "ACTIVE" } },
        } as IAutomationMetadataObject;
        handleResumeAlert(alertToResume);
    };

    const deleteExistingAlert = async (alert: IAutomationMetadataObject) => {
        setIsDeletingAlert(true);
        try {
            await effectiveBackend.workspace(effectiveWorkspace).automations().deleteAutomation(alert.id);
            addSuccess(messages.alertDeleteSuccess);
            setIsDeletingAlert(false);
            setViewMode(alerts.length === 1 ? "create" : "list");
            handleRefreshAutomations();
        } catch (err) {
            addError(messages.alertDeleteError);
            setIsDeletingAlert(false);
        }
    };

    const handleRefreshAutomations = useCallback(() => {
        setIsRefreshingAutomations(true);
        dispatchAndWaitFor(dispatch, refreshAutomations())
            .then(() => {
                setIsRefreshingAutomations(false);
            })
            .catch(() => setIsRefreshingAutomations(false));
    }, [dispatch]);

    return {
        isLoading:
            isSavingAlert ||
            isLoadingFilters ||
            isRefreshingAutomations ||
            isDeletingAlert ||
            metricsAndFactsLoading,
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
        catalogMeasures: metricsAndFacts?.metrics ?? [],
    };
};
