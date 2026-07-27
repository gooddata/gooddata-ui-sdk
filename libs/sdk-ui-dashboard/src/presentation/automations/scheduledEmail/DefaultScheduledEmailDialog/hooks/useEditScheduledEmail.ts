// (C) 2019-2026 GoodData Corporation

import { useCallback, useMemo, useRef, useState } from "react";

import {
    type AutomationEvaluationMode,
    DEFAULT_CSV_DELIMITER,
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
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
    isInsightWidget,
} from "@gooddata/sdk-model";

import {
    getAutomationExportParametersByTab,
    setExportParametersByTab,
} from "../../../../../_staging/automation/index.js";
import type { IAutomationFiltersTab } from "../../../../../model/store/filtering/types.js";
import { useAutomationsContext } from "../../../contexts/AutomationsContext.js";
import { useScheduledEmailDialogContext } from "../../../contexts/ScheduledEmailDialogContext.js";
import { shouldStoreExportParameters } from "../../../shared/automationFilters/automationParameters.js";
import { getDefaultSelectedFiltersFromFiltersByTab } from "../../../shared/automationFilters/useAutomationFiltersSelect.js";
import {
    getAppliedDashboardFilters,
    getAppliedWidgetFilters,
    getVisibleFiltersByFilters,
    getVisibleFiltersByFiltersByTab,
} from "../../../shared/automationFilters/utils.js";
import {
    convertCurrentUserToAutomationRecipient,
    convertCurrentUserToWorkspaceUser,
    convertExternalRecipientToAutomationRecipient,
} from "../../../shared/utils/automationUtils.js";
import {
    toModifiedISOStringToTimezone,
    toNormalizedFirstRunAndCron,
    toNormalizedStartDate,
} from "../../utils/date.js";
import { getUserTimezone } from "../../utils/timezone.js";
import {
    newDashboardExportDefinitionMetadataObjectDefinition,
    newWidgetExportDefinitionMetadataObjectDefinition,
} from "../utils/exportDefinitions.js";

import { useScheduledEmailExportSettings } from "./useScheduledEmailExportSettings.js";
import { useScheduledEmailFormValidity } from "./useScheduledEmailFormValidity.js";

export interface IUseEditScheduledEmailProps {
    scheduledExportToEdit?: IAutomationMetadataObject;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    maxAutomationsRecipients: number;
    /** Workspace users, lazy-loaded in the connector and passed via dialog props. */
    users: IWorkspaceUser[];
    widget?: IWidget;
    insight?: IInsight;
    widgetFilters?: IFilter[];
    editedAutomationFilters?: FilterContextItem[];
    dashboardFilters?: FilterContextItem[];
    setEditedAutomationFilters: (filters: FilterContextItem[]) => void;

    /**
     * Edited filters structured by tab ID for dashboard automations with tabs enabled.
     * When provided, these are used instead of dashboardFilters for per-tab filter storage.
     */
    editedAutomationFiltersByTab?: Record<string, FilterContextItem[]>;
    /**
     * Setter for editedFiltersByTab state.
     * Used to update filters for a specific tab.
     */
    setEditedAutomationFiltersByTab?: (filters: Record<string, FilterContextItem[]>) => void;
    filtersDataByTab?: IAutomationFiltersTab[] | undefined;
    availableFiltersAsVisibleFilters?: IAutomationVisibleFilter[] | undefined;
    availableFiltersAsVisibleFiltersByTab?: Record<string, IAutomationVisibleFilter[]>;
    // Option to opt out of storing filters
    storeFilters?: boolean;
    setStoreFilters: (storeFilters: boolean) => void;
    filtersForNewAutomation: FilterContextItem[];
    externalRecipientOverride?: string;
    defaultPdfPageSize?: IExportDefinitionVisualizationObjectSettings["pageSize"];
}

export function useEditScheduledEmail({
    scheduledExportToEdit,
    notificationChannels,
    insight,
    widget,
    users,
    editedAutomationFilters,
    dashboardFilters,
    editedAutomationFiltersByTab,
    maxAutomationsRecipients,
    setEditedAutomationFilters,
    setEditedAutomationFiltersByTab,
    availableFiltersAsVisibleFilters,
    storeFilters,
    setStoreFilters,
    filtersForNewAutomation,
    externalRecipientOverride,
    defaultPdfPageSize,
    filtersDataByTab,
    availableFiltersAsVisibleFiltersByTab,
}: IUseEditScheduledEmailProps) {
    const {
        settings,
        timezone,
        currentUser,
        features: { enableAutomationEvaluationMode },
    } = useAutomationsContext();
    const {
        dashboardId,
        dashboardTitle,
        hiddenFilters: dashboardHiddenFilters,
        commonDateFilterId,
        widgetLocalIdToTabIdMap: widgetTabMap,
        exportParametersByTab: effectiveExportParametersByTab,
    } = useScheduledEmailDialogContext();
    const [isCronValid, setIsCronValid] = useState(true);
    const [isTitleValid, setIsTitleValid] = useState(true);
    const [isSubjectValid, setIsSubjectValid] = useState(true);
    const [isOnMessageValid, setIsOnMessageValid] = useState(true);
    const isWidget = !!widget && !!insight;

    // Dashboard
    const resolvedDefaultCsvDelimiter = settings?.exportCsvCustomDelimiter ?? DEFAULT_CSV_DELIMITER;

    const areDashboardFiltersChanged = !!dashboardFilters;

    const defaultUser = convertCurrentUserToWorkspaceUser(users ?? [], currentUser);

    const defaultRecipient = externalRecipientOverride
        ? convertExternalRecipientToAutomationRecipient(externalRecipientOverride)
        : convertCurrentUserToAutomationRecipient(users ?? [], currentUser);

    const firstChannel = notificationChannels[0]?.id;

    // Determine target tab ID if widget is present
    const targetTabId = widget?.localIdentifier ? widgetTabMap[widget.localIdentifier] : undefined;

    const effectiveWidgetFilters = getAppliedWidgetFilters(
        editedAutomationFilters ?? [],
        dashboardHiddenFilters,
        widget,
        insight,
        commonDateFilterId,
        false,
    );

    const effectiveWidgetFiltersWithInsight = getAppliedWidgetFilters(
        editedAutomationFilters ?? [],
        dashboardHiddenFilters,
        widget,
        insight,
        commonDateFilterId,
        true,
    );

    const effectiveVisibleWidgetFilters = getVisibleFiltersByFilters(
        editedAutomationFilters,
        availableFiltersAsVisibleFilters,
        true,
    );

    const effectiveDashboardFilters = getAppliedDashboardFilters(
        editedAutomationFilters ?? [],
        dashboardHiddenFilters,
        isWidget ? true : storeFilters,
    );

    // Process filters per tab if provided (for dashboard automations with tabs enabled)
    const effectiveDashboardFiltersByTab = useMemo((): Record<string, FilterContextItem[]> | undefined => {
        if (!editedAutomationFiltersByTab || !storeFilters) {
            return undefined;
        }
        // Apply the same processing as effectiveDashboardFilters to each tab's filters
        return Object.entries(editedAutomationFiltersByTab).reduce<Record<string, FilterContextItem[]>>(
            (acc, [tabId, filters]) => {
                const tabHiddenFilters =
                    filtersDataByTab?.find((tab) => tab.tabId === tabId)?.hiddenFilters ?? [];
                const appliedFilters = getAppliedDashboardFilters(
                    filters ?? [],
                    tabHiddenFilters,
                    storeFilters,
                );
                // Only add if we got filters back (storeFilters is true)
                if (appliedFilters) {
                    acc[tabId] = appliedFilters;
                }
                return acc;
            },
            {},
        );
    }, [editedAutomationFiltersByTab, filtersDataByTab, storeFilters]);

    const effectiveVisibleDashboardFilters = getVisibleFiltersByFilters(
        editedAutomationFilters ?? [],
        availableFiltersAsVisibleFilters,
        storeFilters,
    );

    const effectiveVisibleDashboardFiltersByTab = getVisibleFiltersByFiltersByTab(
        editedAutomationFiltersByTab,
        availableFiltersAsVisibleFiltersByTab,
        storeFilters,
    );

    // Mirrors the filters seed above, for parameters.
    const parametersByTabForNewAutomation =
        shouldStoreExportParameters(isWidget, storeFilters) &&
        Object.keys(effectiveExportParametersByTab).length > 0
            ? effectiveExportParametersByTab
            : undefined;

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

    // Holds the wire outside the automation so it survives a rebuild from zero export definitions —
    // with no definitions `setExportParametersByTab` has nowhere to store it.
    // Seeded from the stored wire.
    const latestParametersWireRef = useRef<Record<string, IDashboardExportParameter[]> | undefined>(
        getAutomationExportParametersByTab(editedAutomation),
    );

    // The user-edit path into `content.parametersByTab`: re-encoded wire in, every export definition
    // patched. Handed to `useAutomationExportParameters`, which owns when to call it. Definition
    // rebuilds preserve the wire separately via `withRebuiltExportDefinitions`.
    const setParametersWire = useCallback((wire: Record<string, IDashboardExportParameter[]> | undefined) => {
        latestParametersWireRef.current = wire;
        setEditedAutomation((automation) => setExportParametersByTab(automation, wire));
    }, []);

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

    const onFiltersChange = useCallback(
        (filters: FilterContextItem[], storeFiltersParam?: boolean) => {
            setEditedAutomationFilters(filters);
            const shouldStoreFilters = storeFiltersParam ?? storeFilters;

            if (isWidget) {
                if (!isInsightWidget(widget)) {
                    return;
                }

                setEditedAutomation((s) => {
                    const appliedDashboardFilters = getAppliedDashboardFilters(
                        filters,
                        dashboardHiddenFilters,
                        true,
                    );
                    const appliedWidgetFiltersWithInsight = getAppliedWidgetFilters(
                        filters,
                        dashboardHiddenFilters,
                        widget,
                        insight,
                        commonDateFilterId,
                        true,
                    );

                    const appliedWidgetFiltersWithoutInsight = getAppliedWidgetFilters(
                        filters,
                        dashboardHiddenFilters,
                        widget,
                        insight,
                        commonDateFilterId,
                        false,
                    );
                    const visibleFilters = getVisibleFiltersByFilters(
                        filters,
                        availableFiltersAsVisibleFilters,
                        true,
                    );

                    return {
                        ...s,
                        exportDefinitions: s.exportDefinitions?.map((exportDefinition) => {
                            if (
                                isExportDefinitionVisualizationObjectRequestPayload(
                                    exportDefinition.requestPayload,
                                )
                            ) {
                                const format = exportDefinition.requestPayload.format;
                                const shouldUseWidgetFiltersWithInsight = format === "CSV";
                                const shouldUseWidgetFiltersWithoutInsight = format === "CSV_RAW";
                                const appliedFilters = shouldUseWidgetFiltersWithInsight
                                    ? appliedWidgetFiltersWithInsight
                                    : shouldUseWidgetFiltersWithoutInsight
                                      ? appliedWidgetFiltersWithoutInsight
                                      : appliedDashboardFilters;
                                return {
                                    ...exportDefinition,
                                    requestPayload: {
                                        ...exportDefinition.requestPayload,
                                        content: {
                                            ...exportDefinition.requestPayload.content,
                                            filters: appliedFilters,
                                        },
                                    },
                                };
                            } else {
                                return exportDefinition;
                            }
                        }),
                        metadata: {
                            ...s.metadata,
                            visibleFilters,
                        },
                    };
                });
            } else {
                setEditedAutomation((s) => {
                    const appliedFilters = getAppliedDashboardFilters(
                        filters,
                        dashboardHiddenFilters,
                        shouldStoreFilters,
                    );
                    const visibleFilters = getVisibleFiltersByFilters(
                        filters,
                        availableFiltersAsVisibleFilters,
                        shouldStoreFilters,
                    );

                    return {
                        ...s,
                        exportDefinitions: s.exportDefinitions?.map((exportDefinition) => {
                            if (isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload)) {
                                return {
                                    ...exportDefinition,
                                    requestPayload: {
                                        ...exportDefinition.requestPayload,
                                        content: {
                                            ...exportDefinition.requestPayload.content,
                                            filters: appliedFilters,
                                        },
                                    },
                                };
                            } else {
                                return exportDefinition;
                            }
                        }),
                        metadata: {
                            ...s.metadata,
                            visibleFilters,
                        },
                    };
                });
            }
        },
        [
            setEditedAutomationFilters,
            setEditedAutomation,
            dashboardHiddenFilters,
            availableFiltersAsVisibleFilters,
            storeFilters,
            widget,
            insight,
            isWidget,
            commonDateFilterId,
        ],
    );

    // Callback for per-tab filter changes - updates state AND syncs to export definitions
    const onFiltersByTabChange = useCallback(
        (newFiltersByTab: Record<string, FilterContextItem[]>, storeFiltersParam?: boolean) => {
            // Update the editedFiltersByTab state
            setEditedAutomationFiltersByTab?.(newFiltersByTab);
            const shouldStoreFilters = storeFiltersParam ?? storeFilters;

            const newEffectiveFiltersByTab = shouldStoreFilters
                ? Object.entries(newFiltersByTab).reduce<Record<string, FilterContextItem[]>>(
                      (acc, [tabId, filters]) => {
                          const tabHiddenFilters =
                              filtersDataByTab?.find((tab) => tab.tabId === tabId)?.hiddenFilters ?? [];
                          const appliedFilters = getAppliedDashboardFilters(
                              filters ?? [],
                              tabHiddenFilters,
                              true,
                          );
                          if (appliedFilters) {
                              acc[tabId] = appliedFilters;
                          }
                          return acc;
                      },
                      {},
                  )
                : undefined;

            const newVisibleFiltersByTab = getVisibleFiltersByFiltersByTab(
                newFiltersByTab,
                availableFiltersAsVisibleFiltersByTab,
                shouldStoreFilters,
            );

            // Sync to export definitions AND metadata
            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: s.exportDefinitions?.map((exportDefinition) => {
                    if (isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload)) {
                        return {
                            ...exportDefinition,
                            requestPayload: {
                                ...exportDefinition.requestPayload,
                                content: {
                                    ...exportDefinition.requestPayload.content,
                                    filtersByTab: newEffectiveFiltersByTab,
                                },
                            },
                        };
                    }
                    return exportDefinition;
                }),
                metadata: {
                    ...s.metadata,
                    visibleFiltersByTab: newVisibleFiltersByTab,
                },
            }));
        },
        [
            setEditedAutomationFiltersByTab,
            storeFilters,
            setEditedAutomation,
            availableFiltersAsVisibleFiltersByTab,
            filtersDataByTab,
        ],
    );

    const onApplyCurrentFilters = useCallback(() => {
        // Widget schedules should never use per-tab filters, only dashboard schedules can have tabs
        const filtersByTabForNewAutomation = widget
            ? undefined
            : getDefaultSelectedFiltersFromFiltersByTab(filtersDataByTab);
        if (filtersByTabForNewAutomation) {
            onFiltersByTabChange(filtersByTabForNewAutomation);
        } else {
            onFiltersChange(filtersForNewAutomation ?? [], widget ? true : storeFilters);
        }
    }, [
        filtersForNewAutomation,
        storeFilters,
        onFiltersChange,
        onFiltersByTabChange,
        widget,
        filtersDataByTab,
    ]);

    const onStoreFiltersChange = useCallback(
        (
            value: boolean,
            filters?: FilterContextItem[],
            filtersByTabParam?: Record<string, FilterContextItem[]>,
        ) => {
            setStoreFilters(value);

            // If filtersByTab is provided, use onFiltersByTabChange, otherwise use onFiltersChange
            if (filtersByTabParam) {
                // Trigger filtersByTab change which handles the sync
                onFiltersByTabChange(filtersByTabParam, value);
            }
            if (filters) {
                // Use regular filters change
                onFiltersChange(filters, value);
            }
        },
        [onFiltersChange, onFiltersByTabChange, setStoreFilters],
    );

    const {
        selectedAttachments,
        isDashboardExportSelected,
        isCsvExportSelected,
        isXlsxExportSelected,
        xlsxSettings,
        pdfSettings,
        csvSettings,
        csvRawSettings,
        slidesTemplateIds,
        onDashboardAttachmentsChange,
        onWidgetAttachmentsChange,
        onXlsxSettingsChange,
        onPdfSettingsChange,
        onCsvSettingsChange,
        onCsvRawSettingsChange,
        onSlidesTemplateIdChange,
    } = useScheduledEmailExportSettings({
        editedAutomation,
        setEditedAutomation,
        insight,
        widget,
        dashboardId,
        dashboardTitle,
        storeFilters,
        effectiveDashboardFilters,
        effectiveDashboardFiltersByTab,
        effectiveWidgetFilters,
        effectiveWidgetFiltersWithInsight,
        defaultPdfPageSize,
        resolvedDefaultCsvDelimiter,
        latestParametersWireRef,
    });

    const startDate = toNormalizedStartDate(
        editedAutomation.schedule?.firstRun,
        editedAutomation.schedule?.timezone,
    );

    const {
        isSubmitDisabled,
        validationErrorMessage,
        isParentValid,
        allowExternalRecipients,
        allowOnlyLoggedUserRecipients,
    } = useScheduledEmailFormValidity({
        editedAutomation,
        originalAutomation,
        scheduledExportToEdit,
        notificationChannels,
        defaultRecipient,
        maxAutomationsRecipients,
        isCronValid,
        isTitleValid,
        isSubjectValid,
        isOnMessageValid,
    });

    return {
        defaultUser,
        areDashboardFiltersChanged,
        originalAutomation,
        editedAutomation,
        isCronValid,
        notificationChannels,
        isDashboardExportSelected,
        isCsvExportSelected,
        isXlsxExportSelected,
        xlsxSettings,
        pdfSettings,
        csvSettings,
        csvRawSettings,
        startDate,
        allowOnlyLoggedUserRecipients,
        allowExternalRecipients,
        validationErrorMessage,
        isSubmitDisabled,
        storeFilters,
        selectedAttachments,
        isParentValid,
        onTitleChange,
        onRecurrenceChange,
        onEvaluationModeChange,
        onDestinationChange,
        onRecipientsChange,
        onSubjectChange,
        onMessageChange,
        onDashboardAttachmentsChange,
        onWidgetAttachmentsChange,
        onXlsxSettingsChange,
        onPdfSettingsChange,
        onCsvSettingsChange,
        onCsvRawSettingsChange,
        slidesTemplateIds,
        onSlidesTemplateIdChange,
        onFiltersChange,
        onApplyCurrentFilters,
        onStoreFiltersChange,
        onFiltersByTabChange,
        setParametersWire,
        enableAutomationEvaluationMode,
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
