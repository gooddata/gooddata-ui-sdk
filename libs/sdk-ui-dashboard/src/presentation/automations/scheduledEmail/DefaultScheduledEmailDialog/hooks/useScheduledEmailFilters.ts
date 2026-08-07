// (C) 2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useCallback } from "react";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IAutomationVisibleFilter,
    type IDashboardExportParameter,
    type IInsight,
    type IWidget,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
    isInsightWidget,
} from "@gooddata/sdk-model";

import type { IAutomationFiltersTab } from "../../../../../model/store/filtering/types.js";
import { useScheduledEmailDialogContext } from "../../../contexts/ScheduledEmailDialogContext.js";
import { useValidateExistingAutomationFilters } from "../../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js";
import {
    type IUseAutomationExportParameters,
    useAutomationExportParameters,
} from "../../../shared/automationFilters/useAutomationExportParameters.js";
import { getDefaultSelectedFiltersFromFiltersByTab } from "../../../shared/automationFilters/useAutomationFiltersSelect.js";
import {
    getAppliedDashboardFilters,
    getAppliedWidgetFilters,
    getVisibleFiltersByFilters,
    getVisibleFiltersByFiltersByTab,
} from "../../../shared/filters/index.js";

export interface IUseScheduledEmailFiltersProps {
    setEditedAutomation: Dispatch<SetStateAction<IAutomationMetadataObjectDefinition>>;
    scheduledExportToEdit?: IAutomationMetadataObject;
    widget?: IWidget;
    insight?: IInsight;
    editedAutomationFilters: FilterContextItem[];
    setEditedAutomationFilters: (filters: FilterContextItem[]) => void;
    editedAutomationFiltersByTab?: Record<string, FilterContextItem[]>;
    setEditedAutomationFiltersByTab?: (filters: Record<string, FilterContextItem[]>) => void;
    availableFilters?: FilterContextItem[];
    availableFiltersAsVisibleFilters?: IAutomationVisibleFilter[] | undefined;
    availableFiltersAsVisibleFiltersByTab?: Record<string, IAutomationVisibleFilter[]>;
    filtersByTab?: IAutomationFiltersTab[] | undefined;
    storeFilters: boolean;
    setStoreFilters: (storeFilters: boolean) => void;
    filtersForNewAutomation: FilterContextItem[];
    setParametersWire: (wire: Record<string, IDashboardExportParameter[]> | undefined) => void;
}

/**
 * The scheduled-email dialog's single filter model: the current selection and available filters
 * (flat and per-tab), the handlers that mutate them and mirror the result into the draft, the
 * `automationIsValid`/`filtersAreStale` staleness gate for a saved schedule, and the absorbed
 * export-parameters model (chips, add/change/delete handlers, apply-latest and store-toggle).
 * `automationIsValid` gates the repair / apply-current-filters dialog: it is false whenever the
 * saved filters no longer match the dashboard, or the saved parameters are stale, or both — it does
 * not distinguish which. `filtersAreStale` reports only whether saved filters no longer match.
 * Parameters live here — rather than in form-state, as on the alerting side — because they have no
 * draft dependency of their own; they only need `storeFilters` (the read model) and `setParametersWire`
 * (from {@link useScheduledEmailExportSettings}).
 *
 * @internal
 */
export function useScheduledEmailFilters({
    setEditedAutomation,
    scheduledExportToEdit,
    widget,
    insight,
    editedAutomationFilters,
    setEditedAutomationFilters,
    editedAutomationFiltersByTab,
    setEditedAutomationFiltersByTab,
    availableFilters,
    availableFiltersAsVisibleFilters,
    availableFiltersAsVisibleFiltersByTab,
    filtersByTab,
    storeFilters,
    setStoreFilters,
    filtersForNewAutomation,
    setParametersWire,
}: IUseScheduledEmailFiltersProps): IUseScheduledEmailFilters {
    const {
        hiddenFilters: dashboardHiddenFilters,
        commonDateFilterId,
        exportParametersByTab,
    } = useScheduledEmailDialogContext();
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
                              filtersByTab?.find((tab) => tab.tabId === tabId)?.hiddenFilters ?? [];
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
            filtersByTab,
        ],
    );

    const onApplyCurrentFilters = useCallback(() => {
        // Widget schedules should never use per-tab filters, only dashboard schedules can have tabs
        const filtersByTabForNewAutomation = widget
            ? undefined
            : getDefaultSelectedFiltersFromFiltersByTab(filtersByTab);
        if (filtersByTabForNewAutomation) {
            onFiltersByTabChange(filtersByTabForNewAutomation);
        } else {
            onFiltersChange(filtersForNewAutomation ?? [], widget ? true : storeFilters);
        }
    }, [filtersForNewAutomation, storeFilters, onFiltersChange, onFiltersByTabChange, widget, filtersByTab]);

    const { isValid: automationIsValid, filtersAreStale = false } = useValidateExistingAutomationFilters({
        automationToEdit: scheduledExportToEdit,
        widget,
        insight,
    });

    const parameters = useAutomationExportParameters({
        automationToEdit: scheduledExportToEdit,
        widget,
        storeParameters: storeFilters,
        setParametersWire,
        effectiveParametersByTab: exportParametersByTab,
    });
    const { onStoreParametersChange } = parameters;

    // The store-filters toggle gates parameter persistence as well, and this hook owns both sides of
    // it, so no caller has to remember the parameters half. `value` is forwarded explicitly to every
    // side because `storeFilters` still holds the old one at call time.
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

            onStoreParametersChange(value);
        },
        [onFiltersChange, onFiltersByTabChange, setStoreFilters, onStoreParametersChange],
    );

    return {
        selectedFilters: editedAutomationFilters,
        availableFilters,
        storeFilters,
        filtersByTab,
        editedFiltersByTab: editedAutomationFiltersByTab,
        onFiltersChange,
        onFiltersByTabChange,
        onApplyCurrentFilters,
        onStoreFiltersChange,
        automationIsValid,
        filtersAreStale,
        ...parameters,
    };
}

/**
 * Return type of {@link useScheduledEmailFilters}: its own filter model plus the whole absorbed
 * {@link useAutomationExportParameters} model, spread in verbatim so its member names stay canonical.
 * @internal
 */
export interface IUseScheduledEmailFilters extends IUseAutomationExportParameters {
    selectedFilters: FilterContextItem[];
    availableFilters: FilterContextItem[] | undefined;
    storeFilters: boolean;
    filtersByTab: IAutomationFiltersTab[] | undefined;
    editedFiltersByTab: Record<string, FilterContextItem[]> | undefined;
    onFiltersChange: (filters: FilterContextItem[], storeFiltersParam?: boolean) => void;
    onFiltersByTabChange: (
        newFiltersByTab: Record<string, FilterContextItem[]>,
        storeFiltersParam?: boolean,
    ) => void;
    onApplyCurrentFilters: () => void;
    onStoreFiltersChange: (
        value: boolean,
        filters?: FilterContextItem[],
        filtersByTabParam?: Record<string, FilterContextItem[]>,
    ) => void;
    automationIsValid: boolean;
    filtersAreStale: boolean;
}
