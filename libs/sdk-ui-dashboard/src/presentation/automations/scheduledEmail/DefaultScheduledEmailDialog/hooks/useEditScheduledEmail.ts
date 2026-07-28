// (C) 2019-2026 GoodData Corporation

import { useCallback, useRef } from "react";

import {
    DEFAULT_CSV_DELIMITER,
    type FilterContextItem,
    type IAutomationMetadataObject,
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
import { getDefaultSelectedFiltersFromFiltersByTab } from "../../../shared/automationFilters/useAutomationFiltersSelect.js";
import {
    getAppliedDashboardFilters,
    getAppliedWidgetFilters,
    getVisibleFiltersByFilters,
    getVisibleFiltersByFiltersByTab,
} from "../../../shared/automationFilters/utils.js";
import { toNormalizedStartDate } from "../../utils/date.js";

import { useScheduledEmailEffectiveFilters } from "./useScheduledEmailEffectiveFilters.js";
import { useScheduledEmailExportSettings } from "./useScheduledEmailExportSettings.js";
import { useScheduledEmailFormState } from "./useScheduledEmailFormState.js";
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
        features: { enableAutomationEvaluationMode },
    } = useAutomationsContext();
    const {
        dashboardId,
        dashboardTitle,
        hiddenFilters: dashboardHiddenFilters,
        commonDateFilterId,
        widgetLocalIdToTabIdMap: widgetTabMap,
    } = useScheduledEmailDialogContext();
    const isWidget = !!widget && !!insight;

    // Dashboard
    const resolvedDefaultCsvDelimiter = settings?.exportCsvCustomDelimiter ?? DEFAULT_CSV_DELIMITER;

    const areDashboardFiltersChanged = !!dashboardFilters;

    // Determine target tab ID if widget is present
    const targetTabId = widget?.localIdentifier ? widgetTabMap[widget.localIdentifier] : undefined;

    const {
        effectiveWidgetFilters,
        effectiveWidgetFiltersWithInsight,
        effectiveVisibleWidgetFilters,
        effectiveDashboardFilters,
        effectiveDashboardFiltersByTab,
        effectiveVisibleDashboardFilters,
        effectiveVisibleDashboardFiltersByTab,
        parametersByTabForNewAutomation,
    } = useScheduledEmailEffectiveFilters({
        widget,
        insight,
        editedAutomationFilters,
        editedAutomationFiltersByTab,
        availableFiltersAsVisibleFilters,
        availableFiltersAsVisibleFiltersByTab,
        filtersDataByTab,
        storeFilters,
    });

    const {
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
    } = useScheduledEmailFormState({
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
    });

    // Holds the wire outside the automation so it survives a rebuild from zero export definitions —
    // with no definitions `setExportParametersByTab` has nowhere to store it.
    // Seeded from the stored wire.
    const latestParametersWireRef = useRef<Record<string, IDashboardExportParameter[]> | undefined>(
        getAutomationExportParametersByTab(editedAutomation),
    );

    // The user-edit path into `content.parametersByTab`: re-encoded wire in, every export definition
    // patched. Handed to `useAutomationExportParameters`, which owns when to call it. Definition
    // rebuilds preserve the wire separately via `withRebuiltExportDefinitions`.
    const setParametersWire = useCallback(
        (wire: Record<string, IDashboardExportParameter[]> | undefined) => {
            latestParametersWireRef.current = wire;
            setEditedAutomation((automation) => setExportParametersByTab(automation, wire));
        },
        [setEditedAutomation],
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
