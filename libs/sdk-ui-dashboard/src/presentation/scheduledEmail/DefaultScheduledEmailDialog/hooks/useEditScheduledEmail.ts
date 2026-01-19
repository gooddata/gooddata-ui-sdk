// (C) 2019-2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { useIntl } from "react-intl";
import { invariant } from "ts-invariant";

import {
    type AutomationEvaluationMode,
    type DashboardAttachmentType,
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectBase,
    type IAutomationMetadataObjectDefinition,
    type IAutomationRecipient,
    type IAutomationVisibleFilter,
    type IExportDefinitionDashboardSettings,
    type IExportDefinitionMetadataObjectDefinition,
    type IExportDefinitionVisualizationObjectSettings,
    type IFilter,
    type IInsight,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type WidgetAttachmentType,
    isAutomationExternalUserRecipient,
    isAutomationUnknownUserRecipient,
    isAutomationUserRecipient,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
    isInsightWidget,
    isWidget,
} from "@gooddata/sdk-model";

import { useScheduleValidation } from "./useScheduleValidation.js";
import {
    areAutomationsEqual,
    convertCurrentUserToAutomationRecipient,
    convertCurrentUserToWorkspaceUser,
    convertExternalRecipientToAutomationRecipient,
    isCsvVisualizationAutomation,
    isCsvVisualizationExportDefinition,
    isDashboardAutomation,
    isXlsxVisualizationAutomation,
    isXlsxVisualizationExportDefinition,
} from "../../../../_staging/automation/index.js";
import {
    type ExtendedDashboardWidget,
    type IAutomationFiltersTab,
    selectAutomationCommonDateFilterId,
    selectCurrentUser,
    selectDashboardHiddenFilters,
    selectDashboardId,
    selectDashboardTitle,
    selectEnableAutomationEvaluationMode,
    selectEnableDashboardTabs,
    selectEnableExternalRecipients,
    selectTimezone,
    selectUsers,
    selectWidgetLocalIdToTabIdMap,
    useDashboardSelector,
} from "../../../../model/index.js";
import { getDefaultSelectedFiltersFromFiltersByTab } from "../../../automationFilters/useAutomationFiltersSelect.js";
import {
    getAppliedDashboardFilters,
    getAppliedWidgetFilters,
    getVisibleFiltersByFilters,
    getVisibleFiltersByFiltersByTab,
} from "../../../automationFilters/utils.js";
import {
    toModifiedISOStringToTimezone,
    toNormalizedFirstRunAndCron,
    toNormalizedStartDate,
} from "../../utils/date.js";
import { getUserTimezone } from "../../utils/timezone.js";
import { isEmail } from "../../utils/validate.js";
import { type OldWidgetAttachmentType } from "../types.js";

export interface IUseEditScheduledEmailProps {
    scheduledExportToEdit?: IAutomationMetadataObject;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    maxAutomationsRecipients: number;
    widget?: ExtendedDashboardWidget;
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
    enableAutomationFilterContext?: boolean;
    filtersForNewAutomation: FilterContextItem[];
    externalRecipientOverride?: string;
    enableNewScheduledExport: boolean;
}

export function useEditScheduledEmail({
    scheduledExportToEdit,
    notificationChannels,
    insight,
    widget,
    editedAutomationFilters,
    dashboardFilters,
    editedAutomationFiltersByTab,
    widgetFilters,
    maxAutomationsRecipients,
    setEditedAutomationFilters,
    setEditedAutomationFiltersByTab,
    availableFiltersAsVisibleFilters,
    storeFilters,
    setStoreFilters,
    enableAutomationFilterContext,
    filtersForNewAutomation,
    externalRecipientOverride,
    enableNewScheduledExport,
    filtersDataByTab,
    availableFiltersAsVisibleFiltersByTab,
}: IUseEditScheduledEmailProps) {
    const intl = useIntl();
    const [isCronValid, setIsCronValid] = useState(true);
    const [isTitleValid, setIsTitleValid] = useState(true);
    const [isSubjectValid, setIsSubjectValid] = useState(true);
    const [isOnMessageValid, setIsOnMessageValid] = useState(true);
    const isWidget = !!widget && !!insight;

    // Dashboard
    const dashboardId = useDashboardSelector(selectDashboardId);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const timezone = useDashboardSelector(selectTimezone);

    const areDashboardFiltersChanged = !!dashboardFilters;

    const currentUser = useDashboardSelector(selectCurrentUser);
    const users = useDashboardSelector(selectUsers);
    const defaultUser = convertCurrentUserToWorkspaceUser(users ?? [], currentUser);

    const defaultRecipient = externalRecipientOverride
        ? convertExternalRecipientToAutomationRecipient(externalRecipientOverride)
        : convertCurrentUserToAutomationRecipient(users ?? [], currentUser);
    const enabledExternalRecipients = useDashboardSelector(selectEnableExternalRecipients);
    const enableAutomationEvaluationMode = useDashboardSelector(selectEnableAutomationEvaluationMode);

    const firstChannel = notificationChannels[0]?.id;

    const dashboardHiddenFilters = useDashboardSelector(selectDashboardHiddenFilters);
    const commonDateFilterId = useDashboardSelector(selectAutomationCommonDateFilterId);
    const enableDashboardTabs = useDashboardSelector(selectEnableDashboardTabs);
    const widgetTabMap = useDashboardSelector(selectWidgetLocalIdToTabIdMap);

    // Determine target tab ID if tabs are enabled and widget is present
    const targetTabId =
        enableDashboardTabs && widget?.localIdentifier ? widgetTabMap[widget.localIdentifier] : undefined;

    const effectiveWidgetFilters = enableAutomationFilterContext
        ? getAppliedWidgetFilters(
              editedAutomationFilters ?? [],
              dashboardHiddenFilters,
              widget,
              insight,
              commonDateFilterId,
              false,
          )
        : widgetFilters;

    const effectiveWidgetFiltersWithInsight = enableAutomationFilterContext
        ? getAppliedWidgetFilters(
              editedAutomationFilters ?? [],
              dashboardHiddenFilters,
              widget,
              insight,
              commonDateFilterId,
              true,
          )
        : widgetFilters;

    const effectiveVisibleWidgetFilters = enableAutomationFilterContext
        ? getVisibleFiltersByFilters(editedAutomationFilters, availableFiltersAsVisibleFilters, true)
        : undefined;

    const effectiveDashboardFilters = enableAutomationFilterContext
        ? getAppliedDashboardFilters(
              editedAutomationFilters ?? [],
              dashboardHiddenFilters,
              isWidget ? true : storeFilters,
          )
        : dashboardFilters;

    // Process filters per tab if provided (for dashboard automations with tabs enabled)
    const effectiveDashboardFiltersByTab = useMemo((): Record<string, FilterContextItem[]> | undefined => {
        if (!editedAutomationFiltersByTab || !enableAutomationFilterContext || !storeFilters) {
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
    }, [editedAutomationFiltersByTab, enableAutomationFilterContext, filtersDataByTab, storeFilters]);

    const effectiveVisibleDashboardFilters = enableAutomationFilterContext
        ? getVisibleFiltersByFilters(
              editedAutomationFilters ?? [],
              availableFiltersAsVisibleFilters,
              storeFilters,
          )
        : undefined;

    const effectiveVisibleDashboardFiltersByTab = enableAutomationFilterContext
        ? getVisibleFiltersByFiltersByTab(
              editedAutomationFiltersByTab,
              availableFiltersAsVisibleFiltersByTab,
              storeFilters,
          )
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
                          enableNewScheduledExport,
                          evaluationMode: "PER_RECIPIENT",
                          targetTabId,
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
                          enableNewScheduledExport,
                          evaluationMode: "PER_RECIPIENT",
                      },
            ),
    );

    const [originalAutomation] = useState(editedAutomation);

    const selectedAttachments = useMemo(() => {
        return (
            editedAutomation.exportDefinitions
                ?.map((exportDefinition) => exportDefinition.requestPayload.format)
                .filter(Boolean) ?? []
        );
    }, [editedAutomation.exportDefinitions]);

    const onTitleChange = (value: string, isValid: boolean) => {
        setIsTitleValid(isValid);
        setEditedAutomation((s) => ({ ...s, title: value }));
    };

    const onRecurrenceChange = (cronExpression: string, startDate: Date | null, isValid: boolean) => {
        setIsCronValid(isValid);
        setEditedAutomation((s) => ({
            ...s,
            schedule: {
                ...(s.schedule ?? {}),
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
                ...(s.details ?? {}),
                subject: value as string,
            },
        }));
    };

    const onMessageChange = (value: string, isValid: boolean): void => {
        setIsOnMessageValid(isValid);
        setEditedAutomation((s) => ({
            ...s,
            details: {
                ...(s.details ?? {}),
                message: value,
            },
        }));
    };

    const onDashboardAttachmentsChange = (
        formats: DashboardAttachmentType[],
        // this needs to be here for compatibility with old component that doesn't use enableAutomationFilterContext
        dashboardFiltersFromComponent?: FilterContextItem[],
    ): void => {
        const filtersToSave = enableAutomationFilterContext
            ? effectiveDashboardFilters
            : (dashboardFiltersFromComponent ?? effectiveDashboardFilters);

        setEditedAutomation((s) => {
            const currentExportDefinitions = s.exportDefinitions || [];

            const currentDashboardExportDefinitions = currentExportDefinitions.filter((exportDefinition) =>
                isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload),
            );

            const currentFormats = currentDashboardExportDefinitions.map(
                (exportDefinition) => exportDefinition.requestPayload.format,
            );

            const formatsToKeep = currentFormats.filter((format) =>
                formats.includes(format as DashboardAttachmentType),
            );
            const formatsToAdd = formats.filter((format) => !currentFormats.includes(format));

            const keptExportDefinitions = currentDashboardExportDefinitions.filter((exportDefinition) =>
                formatsToKeep.includes(exportDefinition.requestPayload.format),
            );

            const newExportDefinitions = formatsToAdd.map((format) =>
                newDashboardExportDefinitionMetadataObjectDefinition({
                    dashboardId: dashboardId!,
                    dashboardTitle,
                    dashboardFilters: storeFilters ? filtersToSave : undefined,
                    filtersByTab: storeFilters ? effectiveDashboardFiltersByTab : undefined,
                    format,
                }),
            );

            const updatedExportDefinitions = [...keptExportDefinitions, ...newExportDefinitions];

            return {
                ...s,
                exportDefinitions: updatedExportDefinitions,
            };
        });
    };

    const onWidgetAttachmentsChange = (formats: WidgetAttachmentType[]): void => {
        invariant(isWidget, "Widget or insight is missing in scheduling dialog context.");
        setEditedAutomation((s) => {
            const currentExportDefinitions = s.exportDefinitions || [];

            const currentWidgetExportDefinitions = currentExportDefinitions.filter((exportDefinition) =>
                isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload),
            );

            const currentFormats = currentWidgetExportDefinitions.map(
                (exportDefinition) => exportDefinition.requestPayload.format,
            );

            const formatsToKeep = currentFormats.filter((format) =>
                formats.includes(format as WidgetAttachmentType),
            );
            const formatsToAdd = formats.filter((format) => !currentFormats.includes(format));

            const keptExportDefinitions = currentWidgetExportDefinitions.filter((exportDefinition) =>
                formatsToKeep.includes(exportDefinition.requestPayload.format),
            );

            const newExportDefinitions = formatsToAdd.map((format) =>
                newWidgetExportDefinitionMetadataObjectDefinition({
                    insight,
                    widget,
                    dashboardId: dashboardId!,
                    format,
                    widgetFilters: effectiveWidgetFilters,
                    widgetFiltersWithInsight: effectiveWidgetFiltersWithInsight,
                    dashboardFilters: effectiveDashboardFilters,
                    enableNewScheduledExport,
                }),
            );

            const updatedExportDefinitions = [...keptExportDefinitions, ...newExportDefinitions];

            return {
                ...s,
                exportDefinitions: updatedExportDefinitions,
            };
        });
    };

    const onDashboardAttachmentsChangeOld = (
        dashboardSelected: boolean,
        dashboardFilters?: FilterContextItem[],
    ): void => {
        if (dashboardSelected) {
            const dashboardExportDefinition = newDashboardExportDefinitionMetadataObjectDefinition({
                dashboardId: dashboardId!,
                dashboardTitle,
                dashboardFilters,
                format: "PDF",
            });
            const dashboardExportDefinitionExists = isDashboardAutomation(editedAutomation);
            const updatedExportDefinitions = dashboardExportDefinitionExists
                ? editedAutomation.exportDefinitions?.map((exportDefinition) =>
                      isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload)
                          ? dashboardExportDefinition
                          : exportDefinition,
                  )
                : [...(editedAutomation.exportDefinitions ?? []), dashboardExportDefinition];

            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: updatedExportDefinitions,
            }));
        } else {
            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: s.exportDefinitions?.filter(
                    (exportDefinition) =>
                        !isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload),
                ),
            }));
        }
    };

    const onWidgetAttachmentsChangeOld = (
        selected: boolean,
        format: OldWidgetAttachmentType,
        /**
         * This prop may be removed in the future, once all automations are using new
         * automation filter context. (enableAutomationFilterContext)
         */
        widgetFilters?: IFilter[],
    ): void => {
        const automationTypeGuard =
            format === "CSV" ? isCsvVisualizationAutomation : isXlsxVisualizationAutomation;
        const exportDefinitionTypeGuard =
            format === "CSV" ? isCsvVisualizationExportDefinition : isXlsxVisualizationExportDefinition;

        invariant(isWidget, "Widget or insight is missing in scheduling dialog context.");

        if (selected) {
            const newExportDefinition = newWidgetExportDefinitionMetadataObjectDefinition({
                insight,
                widget,
                dashboardId: dashboardId!,
                format,
                widgetFilters: enableAutomationFilterContext ? effectiveWidgetFilters : widgetFilters,
                widgetFiltersWithInsight: enableAutomationFilterContext
                    ? effectiveWidgetFiltersWithInsight
                    : widgetFilters,
                dashboardFilters: effectiveDashboardFilters,
                enableNewScheduledExport,
            });

            const exportDefinitionExists = automationTypeGuard(editedAutomation);
            const updatedExportDefinitions = exportDefinitionExists
                ? editedAutomation.exportDefinitions?.map((exportDefinition) =>
                      exportDefinitionTypeGuard(exportDefinition) ? newExportDefinition : exportDefinition,
                  )
                : [...(editedAutomation.exportDefinitions ?? []), newExportDefinition];

            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: updatedExportDefinitions,
            }));
        } else {
            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: s.exportDefinitions?.filter(
                    (exportDefinition) => !exportDefinitionTypeGuard(exportDefinition),
                ),
            }));
        }
    };

    const onAttachmentsSettingsChange = ({
        mergeHeaders,
        exportInfo,
    }: IExportDefinitionVisualizationObjectSettings | IExportDefinitionDashboardSettings) => {
        setEditedAutomation((s) => ({
            ...s,
            exportDefinitions: s.exportDefinitions?.map((exportDefinition) => {
                if (exportDefinition.requestPayload.format === "XLSX") {
                    return {
                        ...exportDefinition,
                        requestPayload: {
                            ...exportDefinition.requestPayload,
                            settings: {
                                ...exportDefinition.requestPayload?.settings,
                                mergeHeaders,
                                exportInfo,
                            },
                        },
                    };
                } else {
                    return exportDefinition;
                }
            }),
        }));
    };

    const onFiltersChange = useCallback(
        (filters: FilterContextItem[], enableNewScheduledExport: boolean, storeFiltersParam?: boolean) => {
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
                                const shouldUseWidgetFiltersWithInsight = enableNewScheduledExport
                                    ? format === "CSV"
                                    : format === "XLSX" || format === "CSV";
                                const shouldUseWidgetFiltersWithoutInsight =
                                    enableNewScheduledExport && format === "CSV_RAW";
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

            const newEffectiveFiltersByTab = Object.entries(newFiltersByTab).reduce<
                Record<string, FilterContextItem[]>
            >((acc, [tabId, filters]) => {
                const tabHiddenFilters =
                    filtersDataByTab?.find((tab) => tab.tabId === tabId)?.hiddenFilters ?? [];
                const appliedFilters = getAppliedDashboardFilters(
                    filters ?? [],
                    tabHiddenFilters,
                    shouldStoreFilters,
                );
                if (appliedFilters) {
                    acc[tabId] = appliedFilters;
                }
                return acc;
            }, {});

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
            onFiltersChange(
                filtersForNewAutomation ?? [],
                enableNewScheduledExport,
                widget ? true : storeFilters,
            );
        }
    }, [
        filtersForNewAutomation,
        storeFilters,
        onFiltersChange,
        onFiltersByTabChange,
        widget,
        enableNewScheduledExport,
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
                onFiltersChange(filters, enableNewScheduledExport, value);
            }
        },
        [onFiltersChange, onFiltersByTabChange, setStoreFilters, enableNewScheduledExport],
    );

    const isDashboardExportSelected =
        editedAutomation.exportDefinitions?.some((exportDefinition) =>
            isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload),
        ) ?? true;

    const isCsvExportSelected =
        editedAutomation.exportDefinitions?.some((exportDefinition) => {
            if (isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload)) {
                return exportDefinition.requestPayload.format === "CSV";
            }

            return false;
        }) ?? false;

    const isXlsxExportSelected =
        editedAutomation.exportDefinitions?.some((exportDefinition) => {
            if (isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload)) {
                return exportDefinition.requestPayload.format === "XLSX";
            }

            return false;
        }) ?? false;

    const settings = {
        mergeHeaders:
            editedAutomation.exportDefinitions?.some(
                (exportDefinition) => exportDefinition.requestPayload.settings?.mergeHeaders,
            ) ?? true,
        exportInfo:
            editedAutomation.exportDefinitions?.some(
                (exportDefinition) => exportDefinition.requestPayload.settings?.exportInfo,
            ) ?? true,
    };

    const startDate = toNormalizedStartDate(
        editedAutomation.schedule?.firstRun,
        editedAutomation.schedule?.timezone,
    );

    const selectedNotificationChannel = notificationChannels.find(
        (channel) => channel.id === editedAutomation.notificationChannel,
    );
    const allowExternalRecipients =
        selectedNotificationChannel?.allowedRecipients === "external" && enabledExternalRecipients;
    const allowOnlyLoggedUserRecipients = selectedNotificationChannel?.allowedRecipients === "creator";

    const { isValid: isParentValid } = useScheduleValidation(originalAutomation);
    const validationErrorMessage = isParentValid
        ? undefined
        : intl.formatMessage({ id: "dialogs.schedule.email.widgetError" });

    const hasAttachments = !!editedAutomation.exportDefinitions?.length;
    const hasRecipients = (editedAutomation.recipients?.length ?? 0) > 0;
    const hasValidExternalRecipients = allowExternalRecipients
        ? true
        : !editedAutomation.recipients?.some(isAutomationExternalUserRecipient);
    const hasValidCreatorRecipient = allowOnlyLoggedUserRecipients
        ? editedAutomation.recipients?.length === 1 &&
          editedAutomation.recipients[0].id === defaultRecipient.id
        : true;
    const hasNoUnknownRecipients = !editedAutomation.recipients?.some(isAutomationUnknownUserRecipient);
    const hasDestination = !!editedAutomation.notificationChannel;
    const respectsRecipientsLimit = (editedAutomation.recipients?.length ?? 0) <= maxAutomationsRecipients;
    const hasFilledEmails =
        selectedNotificationChannel?.destinationType === "smtp"
            ? editedAutomation.recipients?.every((recipient) =>
                  isAutomationUserRecipient(recipient) ? isEmail(recipient.email ?? "") : true,
              )
            : true;

    const isValid =
        isCronValid &&
        hasRecipients &&
        respectsRecipientsLimit &&
        hasAttachments &&
        hasDestination &&
        hasValidExternalRecipients &&
        hasValidCreatorRecipient &&
        hasNoUnknownRecipients &&
        hasFilledEmails &&
        isOnMessageValid &&
        isTitleValid &&
        isSubjectValid;

    const isSubmitDisabled =
        !isValid || (scheduledExportToEdit && areAutomationsEqual(originalAutomation, editedAutomation));

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
        settings,
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
        onDashboardAttachmentsChangeOld,
        onWidgetAttachmentsChange,
        onWidgetAttachmentsChangeOld,
        onAttachmentsSettingsChange,
        onFiltersChange,
        onApplyCurrentFilters,
        onStoreFiltersChange,
        onFiltersByTabChange,
        enableAutomationEvaluationMode,
    };
}

function newDashboardExportDefinitionMetadataObjectDefinition({
    dashboardId,
    dashboardTitle,
    dashboardFilters,
    filtersByTab,
    format,
}: {
    dashboardId: string;
    dashboardTitle: string;
    dashboardFilters?: FilterContextItem[];
    filtersByTab?: Record<string, FilterContextItem[]>;
    format: DashboardAttachmentType;
}): IExportDefinitionMetadataObjectDefinition {
    // Use filtersByTab if provided, otherwise fall back to simple filters
    const filtersObj = filtersByTab
        ? { filtersByTab }
        : dashboardFilters
          ? { filters: dashboardFilters }
          : {};

    const settingsObj = format === "XLSX" ? { settings: { mergeHeaders: true, exportInfo: true } } : {};

    return {
        type: "exportDefinition",
        title: dashboardTitle,
        requestPayload: {
            type: "dashboard",
            fileName: dashboardTitle,
            format,
            content: {
                dashboard: dashboardId,
                ...filtersObj,
            },
            ...settingsObj,
        },
    };
}

function newWidgetExportDefinitionMetadataObjectDefinition({
    insight,
    widget,
    dashboardId,
    format,
    widgetFilters,
    widgetFiltersWithInsight,
    dashboardFilters,
    enableNewScheduledExport,
}: {
    insight: IInsight;
    widget: ExtendedDashboardWidget;
    dashboardId: string;
    format: WidgetAttachmentType;
    widgetFilters?: IFilter[];
    widgetFiltersWithInsight?: IFilter[];
    dashboardFilters?: FilterContextItem[];
    enableNewScheduledExport: boolean;
}): IExportDefinitionMetadataObjectDefinition {
    const widgetTitle = isWidget(widget) ? widget?.title : widget?.identifier;

    // Determine which filters to use based on format:
    // - CSV: Use widgetFiltersWithInsight (insight filters merged on frontend)
    // - CSV_RAW: Use widgetFilters (insight filters merged on backend)
    // - Other formats: Use dashboardFilters (backend handles insight filter merging)
    const shouldUseCsvFilters = enableNewScheduledExport
        ? format === "CSV"
        : format === "XLSX" || format === "CSV";
    const shouldUseCsvRawFilters = enableNewScheduledExport && format === "CSV_RAW";

    let filtersObj: { filters?: IFilter[] | FilterContextItem[] } = {};
    if (shouldUseCsvFilters && (widgetFiltersWithInsight ?? []).length > 0) {
        filtersObj = { filters: widgetFiltersWithInsight };
    } else if (shouldUseCsvRawFilters && (widgetFilters ?? []).length > 0) {
        filtersObj = { filters: widgetFilters };
    } else if (!shouldUseCsvFilters && !shouldUseCsvRawFilters && (dashboardFilters ?? []).length > 0) {
        filtersObj = { filters: dashboardFilters };
    }

    const settingsObj = format === "XLSX" ? { settings: { mergeHeaders: true, exportInfo: true } } : {};

    return {
        type: "exportDefinition",
        title: widgetTitle,
        requestPayload: {
            type: "visualizationObject",
            fileName: widgetTitle,
            format: format,
            content: {
                visualizationObject: insight.insight.identifier,
                widget: widget.identifier,
                dashboard: dashboardId,
                ...filtersObj,
            },
            ...settingsObj,
        },
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
    enableNewScheduledExport,
    evaluationMode,
    targetTabId,
}: {
    timezone?: string;
    dashboardId: string;
    notificationChannel: string;
    title?: string;
    insight?: IInsight;
    widget?: ExtendedDashboardWidget;
    recipient: IAutomationRecipient;
    dashboardFilters?: FilterContextItem[];
    filtersByTab?: Record<string, FilterContextItem[]>;
    widgetFilters?: IFilter[];
    widgetFiltersWithInsight?: IFilter[];
    visibleFiltersMetadata?: IAutomationVisibleFilter[];
    visibleFiltersByTab?: Record<string, IAutomationVisibleFilter[]>;
    enableNewScheduledExport: boolean;
    evaluationMode: AutomationEvaluationMode;
    targetTabId?: string;
}): IAutomationMetadataObjectDefinition {
    const { firstRun, cron } = toNormalizedFirstRunAndCron(timezone);
    const exportDefinition =
        widget && insight
            ? newWidgetExportDefinitionMetadataObjectDefinition({
                  insight,
                  widget,
                  dashboardId,
                  format: enableNewScheduledExport ? "PNG" : "XLSX",
                  widgetFilters,
                  widgetFiltersWithInsight,
                  dashboardFilters,
                  enableNewScheduledExport,
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

    return automation;
}
