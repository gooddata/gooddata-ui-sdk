// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import {
    type AutomationEvaluationMode,
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectBase,
    type IAutomationMetadataObjectDefinition,
    type IAutomationRecipient,
    type IAutomationVisibleFilter,
    type IDashboardExportParameter,
    type IExportDefinitionVisualizationObjectSettings,
    type IFilter,
    type IInsight,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type IWidget,
} from "@gooddata/sdk-model";

import { setExportParametersByTab } from "../../../../_staging/automation/index.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { useScheduledEmailDialogContext } from "../../contexts/ScheduledEmailDialogContext.js";
import { isAutomationTitleValid } from "../../shared/utils/automationTitle.js";
import {
    convertExternalRecipientToAutomationRecipient,
    convertUserToAutomationRecipient,
} from "../../shared/utils/automationUtils.js";
import { useExportTimezones } from "../DefaultScheduledEmailDialog/hooks/useExportTimezones.js";
import {
    toModifiedISOStringToTimezone,
    toNormalizedFirstRunAndCron,
    toNormalizedStartDate,
} from "../utils/date.js";
import { getUserTimezone } from "../utils/timezone.js";

import {
    newDashboardExportDefinitionMetadataObjectDefinition,
    newWidgetExportDefinitionMetadataObjectDefinition,
} from "./exportDefinitions.js";

export interface IUseScheduledEmailFormStateProps {
    scheduledExportToEdit?: IAutomationMetadataObject;
    widget?: IWidget;
    insight?: IInsight;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    externalRecipientOverride?: string;
    effectiveWidgetFilters: IFilter[];
    effectiveWidgetFiltersWithInsight: IFilter[];
    effectiveVisibleWidgetFilters: IAutomationVisibleFilter[] | undefined;
    effectiveDashboardFilters: FilterContextItem[] | undefined;
    effectiveDashboardFiltersByTab: Record<string, FilterContextItem[]> | undefined;
    effectiveVisibleDashboardFilters: IAutomationVisibleFilter[] | undefined;
    effectiveVisibleDashboardFiltersByTab: Record<string, IAutomationVisibleFilter[]> | undefined;
    parametersByTabForNewAutomation: Record<string, IDashboardExportParameter[]> | undefined;
    defaultPdfPageSize?: IExportDefinitionVisualizationObjectSettings["pageSize"];
}

/**
 * Owns the scheduled-email dialog's `editedAutomation` draft (initialized either from
 * `scheduledExportToEdit` or via `newAutomationMetadataObjectDefinition`), its `originalAutomation`
 * baseline, the derived defaults (`defaultRecipient`, `defaultUser`), and the form's field/message
 * change handlers and their validity UI state.
 *
 * Values only this hook needs — `timezone`, `currentUser`, and `widgetLocalIdToTabIdMap` from
 * {@link useAutomationsContext}, `dashboardId`/`dashboardTitle` from
 * {@link useScheduledEmailDialogContext} — are read here directly. The effective-filters
 * derivations, `parametersByTabForNewAutomation`, and `defaultPdfPageSize` arrive as params
 * instead, because the parent shares them with other consumers.
 *
 * @internal
 */
export function useScheduledEmailFormState({
    scheduledExportToEdit,
    widget,
    insight,
    notificationChannels,
    externalRecipientOverride,
    effectiveWidgetFilters,
    effectiveWidgetFiltersWithInsight,
    effectiveVisibleWidgetFilters,
    effectiveDashboardFilters,
    effectiveDashboardFiltersByTab,
    effectiveVisibleDashboardFilters,
    effectiveVisibleDashboardFiltersByTab,
    parametersByTabForNewAutomation,
    defaultPdfPageSize,
}: IUseScheduledEmailFormStateProps) {
    const { timezone, currentUser, widgetLocalIdToTabIdMap: widgetTabMap } = useAutomationsContext();
    const { dashboardId, dashboardTitle } = useScheduledEmailDialogContext();

    // Baked into new export definitions when the backend cannot derive the value at run time:
    // override/browser-resolution for dashboard schedules, additionally the dashboard's stored
    // configuration for widget schedules (the backend has only workspace/organization settings
    // available for those).
    const { exportTimezoneId } = useExportTimezones(!!widget && !!insight);

    const isWidget = !!widget && !!insight;

    // Determine target tab ID if widget is present
    const targetTabId = widget?.localIdentifier ? widgetTabMap[widget.localIdentifier] : undefined;

    const defaultUser = useMemo(() => convertUserToAutomationRecipient(currentUser), [currentUser]);

    const defaultRecipient = useMemo(
        () =>
            externalRecipientOverride
                ? convertExternalRecipientToAutomationRecipient(externalRecipientOverride)
                : convertUserToAutomationRecipient(currentUser),
        [externalRecipientOverride, currentUser],
    );

    const firstChannel = notificationChannels[0]?.id;

    const [editedAutomation, setEditedAutomation] = useState<IAutomationMetadataObjectDefinition>(
        () =>
            scheduledExportToEdit ??
            newAutomationMetadataObjectDefinition(
                isWidget
                    ? {
                          timezone,
                          dashboardId: dashboardId!,
                          notificationChannel: firstChannel,
                          insight,
                          widget,
                          recipient: defaultRecipient,
                          widgetFilters: effectiveWidgetFilters,
                          widgetFiltersWithInsight: effectiveWidgetFiltersWithInsight,
                          dashboardFilters: effectiveDashboardFilters,
                          visibleFiltersMetadata: effectiveVisibleWidgetFilters,
                          defaultPdfPageSize,
                          evaluationMode: "PER_RECIPIENT",
                          targetTabId,
                          parametersByTab: parametersByTabForNewAutomation,
                          exportTimezoneId,
                      }
                    : {
                          timezone,
                          dashboardId: dashboardId!,
                          notificationChannel: firstChannel,
                          title: dashboardTitle,
                          recipient: defaultRecipient,
                          dashboardFilters: effectiveDashboardFilters,
                          filtersByTab: effectiveDashboardFiltersByTab,
                          visibleFiltersMetadata: effectiveVisibleDashboardFilters,
                          visibleFiltersByTab: effectiveVisibleDashboardFiltersByTab,
                          defaultPdfPageSize,
                          evaluationMode: "PER_RECIPIENT",
                          parametersByTab: parametersByTabForNewAutomation,
                          exportTimezoneId,
                      },
            ),
    );

    const [originalAutomation] = useState(editedAutomation);

    const startDate = toNormalizedStartDate(
        editedAutomation.schedule?.firstRun,
        editedAutomation.schedule?.timezone,
    );

    const [isCronValid, setIsCronValid] = useState(true);
    const [isTitleValid, setIsTitleValid] = useState(true);
    const [isSubjectValid, setIsSubjectValid] = useState(true);
    const [isOnMessageValid, setIsOnMessageValid] = useState(true);

    const onTitleChange = useCallback((value: string) => {
        setIsTitleValid(isAutomationTitleValid(value));
        setEditedAutomation((s) => ({ ...s, title: value }));
    }, []);

    const onRecurrenceChange = useCallback(
        (cronExpression: string, startDate: Date | null, isValid: boolean) => {
            setIsCronValid(isValid);
            setEditedAutomation((s) => ({
                ...s,
                schedule: {
                    ...s.schedule,
                    cron: cronExpression,
                    // the schedule's own timezone wins so that editing an existing schedule keeps
                    // interpreting the picked date in the timezone it was created with
                    firstRun: toModifiedISOStringToTimezone(
                        startDate ?? new Date(),
                        s.schedule?.timezone ?? timezone,
                    ).iso,
                },
            }));
        },
        [timezone],
    );

    const onEvaluationModeChange = useCallback((isShared: boolean) => {
        setEditedAutomation((s) => ({
            ...s,
            evaluationMode: isShared ? "SHARED" : "PER_RECIPIENT",
        }));
    }, []);

    const onDestinationChange = useCallback((notificationChannelId: string): void => {
        setEditedAutomation((s) => ({
            ...s,
            notificationChannel: notificationChannelId,
        }));
    }, []);

    const onRecipientsChange = useCallback((updatedRecipients: IAutomationRecipient[]): void => {
        setEditedAutomation((s) => ({
            ...s,
            recipients: updatedRecipients,
        }));
    }, []);

    const onSubjectChange = useCallback((value: string | number, isValid: boolean): void => {
        setIsSubjectValid(isValid);
        setEditedAutomation((s) => ({
            ...s,
            details: {
                ...s.details,
                subject: value as string,
            },
        }));
    }, []);

    const onMessageChange = useCallback((value: string, isValid: boolean): void => {
        setIsOnMessageValid(isValid);
        setEditedAutomation((s) => ({
            ...s,
            details: {
                ...s.details,
                message: value,
            },
        }));
    }, []);

    return {
        editedAutomation,
        setEditedAutomation,
        originalAutomation,
        defaultRecipient,
        defaultUser,
        onTitleChange,
        onRecurrenceChange,
        onEvaluationModeChange,
        onDestinationChange,
        onRecipientsChange,
        onSubjectChange,
        onMessageChange,
        isCronValid,
        isTitleValid,
        isSubjectValid,
        isOnMessageValid,
        startDate,
    };
}

function newAutomationMetadataObjectDefinition({
    timezone,
    dashboardId,
    notificationChannel,
    title,
    insight,
    widget,
    recipient,
    dashboardFilters,
    filtersByTab,
    widgetFilters,
    widgetFiltersWithInsight,
    visibleFiltersMetadata,
    visibleFiltersByTab,
    defaultPdfPageSize,
    evaluationMode,
    targetTabId,
    parametersByTab,
    exportTimezoneId,
}: {
    timezone?: string;
    dashboardId: string;
    notificationChannel: string;
    title?: string;
    insight?: IInsight;
    widget?: IWidget;
    recipient: IAutomationRecipient;
    dashboardFilters?: FilterContextItem[];
    filtersByTab?: Record<string, FilterContextItem[]>;
    widgetFilters?: IFilter[];
    widgetFiltersWithInsight?: IFilter[];
    visibleFiltersMetadata?: IAutomationVisibleFilter[];
    visibleFiltersByTab?: Record<string, IAutomationVisibleFilter[]>;
    defaultPdfPageSize?: IExportDefinitionVisualizationObjectSettings["pageSize"];
    evaluationMode: AutomationEvaluationMode;
    targetTabId?: string;
    parametersByTab?: Record<string, IDashboardExportParameter[]>;
    /**
     * Export-content timezone; unrelated to the schedule cron `timezone`. Defined only when the
     * backend cannot derive it at run time (view-mode override or resolved browser-detected
     * timezone) — otherwise nothing is baked and the backend reads the persisted
     * dashboard/settings timezone itself.
     */
    exportTimezoneId?: string;
}): IAutomationMetadataObjectDefinition {
    const { firstRun, cron } = toNormalizedFirstRunAndCron(timezone);
    const exportDefinition =
        widget && insight
            ? newWidgetExportDefinitionMetadataObjectDefinition({
                  insight,
                  widget,
                  dashboardId,
                  format: "PNG",
                  widgetFilters,
                  widgetFiltersWithInsight,
                  dashboardFilters,
                  defaultPdfPageSize,
                  timezoneId: exportTimezoneId,
              })
            : newDashboardExportDefinitionMetadataObjectDefinition({
                  dashboardId,
                  dashboardTitle: title ?? "",
                  dashboardFilters,
                  filtersByTab,
                  format: "PDF",
                  timezoneId: exportTimezoneId,
              });

    let metadataObj: { metadata?: IAutomationMetadataObjectBase["metadata"] } =
        visibleFiltersMetadata || visibleFiltersByTab
            ? {
                  metadata: {
                      ...(visibleFiltersMetadata ? { visibleFilters: visibleFiltersMetadata } : {}),
                      ...(visibleFiltersByTab ? { visibleFiltersByTab } : {}),
                  },
              }
            : {};

    if (targetTabId) {
        metadataObj = {
            ...metadataObj,
            metadata: {
                ...metadataObj.metadata,
                targetTabIdentifier: targetTabId,
            },
        };
    }

    const automation: IAutomationMetadataObjectDefinition = {
        type: "automation",
        title: undefined,
        description: undefined,
        tags: [],
        schedule: {
            timezone: timezone ?? getUserTimezone().identifier,
            firstRun,
            cron,
        },
        details: {
            message: "",
            subject: "",
        },
        exportDefinitions: [{ ...exportDefinition }],
        recipients: [recipient],
        evaluationMode,
        notificationChannel,
        dashboard: dashboardId ? { id: dashboardId } : undefined,
        ...metadataObj,
    };

    return parametersByTab ? setExportParametersByTab(automation, parametersByTab) : automation;
}
