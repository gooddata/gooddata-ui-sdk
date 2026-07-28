// (C) 2026 GoodData Corporation

import { useState } from "react";

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
    type IWorkspaceUser,
} from "@gooddata/sdk-model";

import { setExportParametersByTab } from "../../../../../_staging/automation/index.js";
import { useAutomationsContext } from "../../../contexts/AutomationsContext.js";
import { useScheduledEmailDialogContext } from "../../../contexts/ScheduledEmailDialogContext.js";
import {
    convertCurrentUserToAutomationRecipient,
    convertCurrentUserToWorkspaceUser,
    convertExternalRecipientToAutomationRecipient,
} from "../../../shared/utils/automationUtils.js";
import { toModifiedISOStringToTimezone, toNormalizedFirstRunAndCron } from "../../utils/date.js";
import { getUserTimezone } from "../../utils/timezone.js";
import {
    newDashboardExportDefinitionMetadataObjectDefinition,
    newWidgetExportDefinitionMetadataObjectDefinition,
} from "../utils/exportDefinitions.js";

export interface IUseScheduledEmailFormStateProps {
    scheduledExportToEdit?: IAutomationMetadataObject;
    widget?: IWidget;
    insight?: IInsight;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    /** Workspace users, lazy-loaded in the connector and passed via dialog props. */
    users: IWorkspaceUser[];
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
    targetTabId?: string;
}

/**
 * Owns the scheduled-email dialog's `editedAutomation` draft (initialized either from
 * `scheduledExportToEdit` or via `newAutomationMetadataObjectDefinition`), its `originalAutomation`
 * baseline, the derived defaults (`defaultRecipient`, `defaultUser`), and the form's field/message
 * change handlers and their validity UI state.
 *
 * `timezone` (already part 1) and `currentUser` are read from {@link useAutomationsContext};
 * `dashboardId`/`dashboardTitle` from {@link useScheduledEmailDialogContext}. The effective-filters
 * derivations, `parametersByTabForNewAutomation`, `defaultPdfPageSize`, and `targetTabId` stay owned
 * by the parent (`useEditScheduledEmail`) — shared with other consumers — and are passed in as params.
 *
 * Part 2 of 2 (mirrors the alerting `useAlertFormState` part 2): completes the hook by folding in the
 * draft init that part 1 left in the parent.
 *
 * @internal
 */
export function useScheduledEmailFormState({
    scheduledExportToEdit,
    widget,
    insight,
    notificationChannels,
    users,
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
    targetTabId,
}: IUseScheduledEmailFormStateProps) {
    const { timezone, currentUser } = useAutomationsContext();
    const { dashboardId, dashboardTitle } = useScheduledEmailDialogContext();

    const isWidget = !!widget && !!insight;

    const defaultUser = convertCurrentUserToWorkspaceUser(users ?? [], currentUser);

    const defaultRecipient = externalRecipientOverride
        ? convertExternalRecipientToAutomationRecipient(externalRecipientOverride)
        : convertCurrentUserToAutomationRecipient(users ?? [], currentUser);

    const firstChannel = notificationChannels[0]?.id;

    const [editedAutomation, setEditedAutomation] = useState<IAutomationMetadataObjectDefinition>(
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
                      },
            ),
    );

    const [originalAutomation] = useState(editedAutomation);

    const [isCronValid, setIsCronValid] = useState(true);
    const [isTitleValid, setIsTitleValid] = useState(true);
    const [isSubjectValid, setIsSubjectValid] = useState(true);
    const [isOnMessageValid, setIsOnMessageValid] = useState(true);

    const onTitleChange = (value: string, isValid: boolean) => {
        setIsTitleValid(isValid);
        setEditedAutomation((s) => ({ ...s, title: value }));
    };

    const onRecurrenceChange = (cronExpression: string, startDate: Date | null, isValid: boolean) => {
        setIsCronValid(isValid);
        setEditedAutomation((s) => ({
            ...s,
            schedule: {
                ...s.schedule,
                cron: cronExpression,
                firstRun: toModifiedISOStringToTimezone(startDate ?? new Date(), timezone).iso,
            },
        }));
    };

    const onEvaluationModeChange = (isShared: boolean) => {
        setEditedAutomation((s) => ({
            ...s,
            evaluationMode: isShared ? "SHARED" : "PER_RECIPIENT",
        }));
    };

    const onDestinationChange = (notificationChannelId: string): void => {
        setEditedAutomation((s) => ({
            ...s,
            notificationChannel: notificationChannelId,
        }));
    };

    const onRecipientsChange = (updatedRecipients: IAutomationRecipient[]): void => {
        setEditedAutomation((s) => ({
            ...s,
            recipients: updatedRecipients,
        }));
    };

    const onSubjectChange = (value: string | number, isValid: boolean): void => {
        setIsSubjectValid(isValid);
        setEditedAutomation((s) => ({
            ...s,
            details: {
                ...s.details,
                subject: value as string,
            },
        }));
    };

    const onMessageChange = (value: string, isValid: boolean): void => {
        setIsOnMessageValid(isValid);
        setEditedAutomation((s) => ({
            ...s,
            details: {
                ...s.details,
                message: value,
            },
        }));
    };

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
              })
            : newDashboardExportDefinitionMetadataObjectDefinition({
                  dashboardId,
                  dashboardTitle: title ?? "",
                  dashboardFilters,
                  filtersByTab,
                  format: "PDF",
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
