// (C) 2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useCallback } from "react";

import {
    type FilterContextItem,
    type IAutomationMetadataObjectDefinition,
    type IAutomationVisibleFilter,
    type IInsight,
    type IWidget,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
    isInsightWidget,
} from "@gooddata/sdk-model";

import type { IAutomationFiltersTab } from "../../../../../model/store/filtering/types.js";
import { useScheduledEmailDialogContext } from "../../../contexts/ScheduledEmailDialogContext.js";
import { getDefaultSelectedFiltersFromFiltersByTab } from "../../../shared/automationFilters/useAutomationFiltersSelect.js";
import {
    getAppliedDashboardFilters,
    getAppliedWidgetFilters,
    getVisibleFiltersByFilters,
    getVisibleFiltersByFiltersByTab,
} from "../../../shared/automationFilters/utils.js";

export interface IUseScheduledEmailFiltersProps {
    setEditedAutomation: Dispatch<SetStateAction<IAutomationMetadataObjectDefinition>>;
    widget?: IWidget;
    insight?: IInsight;
    setEditedAutomationFilters: (filters: FilterContextItem[]) => void;
    setEditedAutomationFiltersByTab?: (filters: Record<string, FilterContextItem[]>) => void;
    availableFiltersAsVisibleFilters?: IAutomationVisibleFilter[] | undefined;
    availableFiltersAsVisibleFiltersByTab?: Record<string, IAutomationVisibleFilter[]>;
    filtersDataByTab?: IAutomationFiltersTab[] | undefined;
    storeFilters?: boolean;
    setStoreFilters: (storeFilters: boolean) => void;
    filtersForNewAutomation: FilterContextItem[];
}

/**
 * Owns the four scheduled-email filters handlers: they update the edited filters state and sync the
 * result into the draft's export definitions and `metadata.visibleFilters`/`visibleFiltersByTab`.
 *
 * Filters slice B of 2. Runs after `useScheduledEmailFormState` because the handlers need
 * `setEditedAutomation`; the derivation cluster in {@link useScheduledEmailEffectiveFilters} (slice A)
 * has to run before it, which is why the two are separate hooks. Reads
 * `hiddenFilters`/`commonDateFilterId` from {@link useScheduledEmailDialogContext} internally, same as
 * slice A and as the parent (`useEditScheduledEmail`) did before.
 *
 * @internal
 */
export function useScheduledEmailFilters({
    setEditedAutomation,
    widget,
    insight,
    setEditedAutomationFilters,
    setEditedAutomationFiltersByTab,
    availableFiltersAsVisibleFilters,
    availableFiltersAsVisibleFiltersByTab,
    filtersDataByTab,
    storeFilters,
    setStoreFilters,
    filtersForNewAutomation,
}: IUseScheduledEmailFiltersProps) {
    const { hiddenFilters: dashboardHiddenFilters, commonDateFilterId } = useScheduledEmailDialogContext();
    // Re-derived locally (not passed as a prop) so that the `if (isWidget)` branch below narrows
    // `widget`/`insight` via TS's aliased-condition control-flow analysis — this requires the boolean
    // to be declared from those exact variables in this same scope, same as in the parent.
    const isWidget = !!widget && !!insight;

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

    return {
        onFiltersChange,
        onFiltersByTabChange,
        onApplyCurrentFilters,
        onStoreFiltersChange,
    };
}
