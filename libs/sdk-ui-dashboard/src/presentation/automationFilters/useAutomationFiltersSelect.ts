// (C) 2025 GoodData Corporation
import {
    FilterContextItem,
    IAutomationMetadataObject,
    IAutomationVisibleFilter,
    isAllValuesDashboardAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDashboardDateFilterWithDimension,
    isInsightWidget,
    areObjRefsEqual,
    IDashboardDateFilterReference,
    newAllTimeDashboardDateFilter,
    isAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";
import { useMemo, useState } from "react";
import compact from "lodash/compact.js";
import { getFilterLocalIdentifier, getNonHiddenFilters } from "./utils.js";
import { useFiltersNamings } from "../../_staging/sharedHooks/useFiltersNamings.js";
import {
    ExtendedDashboardWidget,
    selectAttributeFilterConfigsOverrides,
    selectDateFilterConfigsOverrides,
    useDashboardSelector,
    useAutomationAvailableDashboardFilters,
    selectPersistedDashboardFilterContextDateFilterConfig,
} from "../../model/index.js";
import {
    getAutomationDashboardFilters,
    getAutomationVisualizationFilters,
    getAutomationAlertFilters,
} from "../../_staging/automation/index.js";
import { dashboardFilterToFilterContextItem } from "../../_staging/dashboard/dashboardFilterContext.js";
import { isDashboardFilter } from "../../types.js";

interface IUseAutomationFiltersData {
    availableFilters: FilterContextItem[] | undefined;
    automationFilters: FilterContextItem[] | undefined;
    setAutomationFilters: (filters: FilterContextItem[]) => void;
    allVisibleFiltersMetadata: IAutomationVisibleFilter[] | undefined;
    areVisibleFiltersMissingOnDashboard: boolean;
}

/**
 * Hook to get data for AutomationFiltersSelect component.
 *
 * If automationToEdit is provided, returned filters will be the saved filters from the automation, with added non-ignored all-time date filters (to display them in the UI).
 * If automationToEdit is not provided, returned filters will be the default filters usable for the automation.
 */
export const useAutomationFiltersSelect = ({
    widget,
    automationToEdit,
}: {
    /**
     * Widget to edit automation for (if editing widget related automation).
     */
    widget?: ExtendedDashboardWidget;

    /**
     * Alert or scheduled export automation metadata object to edit.
     * If not provided, returned filters will be the default filters usable for the automation.
     */
    automationToEdit?: IAutomationMetadataObject;
}): IUseAutomationFiltersData => {
    const isEditing = !!automationToEdit;
    const metadataVisibleFilters = automationToEdit?.metadata?.visibleFilters;
    const storedDashboardFilters = getAutomationDashboardFilters(automationToEdit);
    const storedWidgetAfmFilters = getAutomationVisualizationFilters(automationToEdit);
    const storedAlertFilters = getAutomationAlertFilters(automationToEdit);
    const availableDashboardFilters = useAutomationAvailableDashboardFilters();
    const availableFilters = useMemo(() => availableDashboardFilters ?? [], [availableDashboardFilters]);

    const storedWidgetFilterContextItems = useMemo(() => {
        return storedWidgetAfmFilters?.filter(isDashboardFilter).map((a) => {
            return dashboardFilterToFilterContextItem(a, true);
        });
    }, [storedWidgetAfmFilters]);

    // Either stored widget filters or stored dashboard filters (in case of editing dashboard scheduled export)
    // Or new filters to be stored in new dashboard/widget scheduled export
    const storedFilterContextItems = useMemo(
        () => storedAlertFilters ?? storedWidgetFilterContextItems ?? storedDashboardFilters,
        [storedAlertFilters, storedWidgetFilterContextItems, storedDashboardFilters],
    );

    const storedFilterContextItemsOrDefaultAutomationFilters = useMemo(() => {
        return storedFilterContextItems ?? availableDashboardFilters ?? [];
    }, [storedFilterContextItems, availableDashboardFilters]);

    // New sanitized filters to be stored in new dashboard/widget scheduled export
    // Or existing filters to be edited
    const effectiveFilters = useMemo(() => {
        // if creating new scheduled export, sanitize filters and remove empty attribute filters
        if (!isEditing || !metadataVisibleFilters) {
            return removeEmptyDashboardAttributeFilters(storedFilterContextItemsOrDefaultAutomationFilters);
        }

        // If editing existing scheduled export, return stored filters, or empty array
        return storedFilterContextItemsOrDefaultAutomationFilters;
    }, [isEditing, metadataVisibleFilters, storedFilterContextItemsOrDefaultAutomationFilters]);

    // add common date filter when it is not present
    const effectiveFiltersWithDateFilters = useMemo(() => {
        return addDateFiltersIfPresentInVisibleFiltersOrNotIgnored(
            effectiveFilters,
            availableFilters,
            widget,
            automationToEdit,
        );
    }, [effectiveFilters, availableFilters, widget]);

    // when creating new automation, remove ignored widget filters
    const effectiveFiltersWithDateFiltersRespectingIgnoredWidgetFilters = useMemo(() => {
        return !automationToEdit
            ? removeIgnoredWidgetFilters(effectiveFiltersWithDateFilters, widget)
            : effectiveFiltersWithDateFilters;
    }, [effectiveFiltersWithDateFilters, widget, automationToEdit]);

    // if editing automation, remove date filters that are not present in visible filters
    const effectiveFiltersWithDateFiltersRespectingVisibleFilters = useMemo(() => {
        return removeDateFiltersIfNotPresentInVisibleFilters(
            effectiveFiltersWithDateFiltersRespectingIgnoredWidgetFilters,
            automationToEdit,
        );
    }, [effectiveFiltersWithDateFiltersRespectingIgnoredWidgetFilters, automationToEdit]);

    // filter out filters that are not on the dashboard
    const sanitizedEffectiveFilters = useMemo(() => {
        const withRemovedFiltersNotPresentOnDashboard = removeFiltersNotPresentOnDashboard(
            effectiveFiltersWithDateFiltersRespectingVisibleFilters,
            availableFilters,
        );

        const withSanitizedCommonDateFilterDataSet = sanitizeCommonDateFilterDataSet(
            availableFilters,
            withRemovedFiltersNotPresentOnDashboard,
        );

        return sortFilters(withSanitizedCommonDateFilterDataSet);
    }, [availableFilters, effectiveFiltersWithDateFiltersRespectingVisibleFilters]);

    const withRemovedHiddenFilters = useRemoveHiddenFilters(sanitizedEffectiveFilters);

    const sanitizedEffectiveFiltersWithoutHiddenFilters = !automationToEdit
        ? withRemovedHiddenFilters
        : sanitizedEffectiveFilters;

    // State of current filters to save/edit
    const [automationFilters, setAutomationFilters] = useState<FilterContextItem[]>(
        sanitizedEffectiveFiltersWithoutHiddenFilters,
    );

    const sortedAutomationFilters = useMemo(() => {
        return sortFilters(automationFilters);
    }, [automationFilters]);

    // Current filters present on the dashboard, transformed to translated visible filters metadata
    const allVisibleFiltersMetadata = useAutomationVisibleFilters(availableFilters, sortedAutomationFilters);

    // Stored visible local identifiers
    const storedVisibleLocalIdentifiersToShow = useMemo(
        () =>
            metadataVisibleFilters
                ? getMetadataVisibleFilterLocalIdentifiers(metadataVisibleFilters)
                : undefined,
        [metadataVisibleFilters],
    );

    // Are some filters that are stored in visible filters missing on the dashboard?
    const areVisibleFiltersMissingOnDashboard = useMemo(() => {
        const allVisibleFiltersSet = new Set(
            allVisibleFiltersMetadata.map((filter) => filter.localIdentifier),
        );
        return (
            storedVisibleLocalIdentifiersToShow?.some((localId) => !allVisibleFiltersSet.has(localId)) ??
            false
        );
    }, [allVisibleFiltersMetadata, storedVisibleLocalIdentifiersToShow]);

    return {
        //
        automationFilters: sortedAutomationFilters,
        setAutomationFilters,
        //
        availableFilters,
        allVisibleFiltersMetadata,
        areVisibleFiltersMissingOnDashboard,
    };
};

//
//
//
//
//

const useAutomationVisibleFilters = (
    availableFilters: FilterContextItem[] | undefined = [],
    effectiveFilters: FilterContextItem[] | undefined = [],
): IAutomationVisibleFilter[] => {
    const filterNamings = useFiltersNamings(availableFilters);

    return useMemo(() => {
        return compact(filterNamings).map((filter) => {
            const targetFilter = effectiveFilters.find((f) =>
                isDashboardAttributeFilter(f)
                    ? f.attributeFilter.localIdentifier === filter.id
                    : f.dateFilter.localIdentifier === filter.id,
            );

            return {
                title: filter.title,
                localIdentifier: filter.id,
                isAllTimeDateFilter: !!targetFilter && isAllTimeDashboardDateFilter(targetFilter),
            };
        });
    }, [filterNamings, effectiveFilters]);
};

function useRemoveHiddenFilters(filters: FilterContextItem[]) {
    const attributeConfigs = useDashboardSelector(selectAttributeFilterConfigsOverrides);
    const dateConfigs = useDashboardSelector(selectDateFilterConfigsOverrides);
    const dateFilterConfig = useDashboardSelector(selectPersistedDashboardFilterContextDateFilterConfig);
    const isCommonDateFilterHidden = dateFilterConfig?.mode === "hidden";

    return useMemo(() => {
        return getNonHiddenFilters(filters, attributeConfigs, dateConfigs, isCommonDateFilterHidden);
    }, [filters, attributeConfigs, dateConfigs]);
}

//
//
//
//
//
//

function getMetadataVisibleFilterLocalId(filter: IAutomationVisibleFilter) {
    return filter.localIdentifier;
}

function getMetadataVisibleFilterLocalIdentifiers(filters: IAutomationVisibleFilter[]) {
    return filters.map(getMetadataVisibleFilterLocalId);
}

function removeEmptyDashboardAttributeFilters(filters: FilterContextItem[]) {
    return filters.filter((filter) => {
        if (isDashboardAttributeFilter(filter)) {
            return !isAllValuesDashboardAttributeFilter(filter);
        }

        return true;
    });
}

function addDateFiltersIfPresentInVisibleFiltersOrNotIgnored(
    /**
     * Current sanitized filters to be stored in new scheduled export or alert, or existing filters to be edited.
     */
    effectiveFilters: FilterContextItem[],
    /**
     * Current dashboard filters, sanitized (cross filtering filters removed)
     * Always should be equal to filters ready to be saved in new automation
     */
    availableDashboardFilters: FilterContextItem[],
    /**
     * Widget (in case of widget automation)
     */
    widget: ExtendedDashboardWidget | undefined,
    /**
     * Automation to edit (in case of editing existing automation)
     */
    automationToEdit?: IAutomationMetadataObject,
) {
    const hasCommonDateFilter = !!effectiveFilters.find(isDashboardCommonDateFilter);
    const dashboardCommonDateFilter = availableDashboardFilters?.find(isDashboardCommonDateFilter);
    const otherDateFilters = availableDashboardFilters?.filter(isDashboardDateFilterWithDimension);

    const ignoredWidgetDateFilters = isInsightWidget(widget)
        ? widget.ignoreDashboardFilters.filter(
              (ignoredFilter): ignoredFilter is IDashboardDateFilterReference =>
                  ignoredFilter.type === "dateFilterReference",
          )
        : [];

    // if editing widget automation, remove date filters that are ignored by the widget
    const otherFiltersRespectingIgnoredWidgetDateFilters =
        isInsightWidget(widget) && !automationToEdit
            ? otherDateFilters.filter(
                  (filter) =>
                      !ignoredWidgetDateFilters.some((ignoredFilter) =>
                          areObjRefsEqual(ignoredFilter.dataSet, filter.dateFilter.dataSet),
                      ),
              )
            : otherDateFilters;

    // do not add ad-hoc date filters if they are already present in effective filters
    const otherFiltersNotPresentInEffectiveFilters = otherFiltersRespectingIgnoredWidgetDateFilters.filter(
        (filter) =>
            !effectiveFilters.some(
                (effectiveFilter) =>
                    isDashboardDateFilter(effectiveFilter) &&
                    areObjRefsEqual(effectiveFilter.dateFilter.dataSet, filter.dateFilter.dataSet),
            ),
    );

    const dashboardCommonDateFilterLocalId = dashboardCommonDateFilter?.dateFilter.localIdentifier;
    const dashboardCommonDateFilterExistsInEffectiveFilters = effectiveFilters.some((filter) => {
        if (isDashboardDateFilter(filter)) {
            return filter.dateFilter.localIdentifier === dashboardCommonDateFilterLocalId;
        }
        return false;
    });

    const widgetSupportsCommonDateFilter = widget ? isInsightWidget(widget) && !!widget.dateDataSet : true;
    const isCommonDateFilterPresentInVisibleFilters = automationToEdit?.metadata?.visibleFilters?.some(
        (filter) => filter.localIdentifier === dashboardCommonDateFilterLocalId,
    );
    const isStoredCommonDateFilterAllTime = automationToEdit
        ? effectiveFilters.every((filter) => !isDashboardCommonDateFilter(filter))
        : false;

    let finalFilters = effectiveFilters;

    if (otherFiltersNotPresentInEffectiveFilters.length > 0) {
        finalFilters = [...otherFiltersNotPresentInEffectiveFilters, ...effectiveFilters];
    }

    if (
        !hasCommonDateFilter &&
        dashboardCommonDateFilter &&
        !dashboardCommonDateFilterExistsInEffectiveFilters &&
        (widgetSupportsCommonDateFilter || isCommonDateFilterPresentInVisibleFilters)
    ) {
        finalFilters = [
            isCommonDateFilterPresentInVisibleFilters && isStoredCommonDateFilterAllTime
                ? newAllTimeDashboardDateFilter(
                      undefined,
                      dashboardCommonDateFilter.dateFilter.localIdentifier,
                  )
                : dashboardCommonDateFilter,
            ...finalFilters,
        ];
    }

    return finalFilters;
}

function removeIgnoredWidgetFilters(
    effectiveFilters: FilterContextItem[],
    widget: ExtendedDashboardWidget | undefined,
) {
    if (!isInsightWidget(widget)) {
        return effectiveFilters;
    }

    return effectiveFilters.filter((filter) =>
        isDashboardCommonDateFilter(filter)
            ? !!widget.dateDataSet
            : !widget.ignoreDashboardFilters.some((ignoredFilter) => {
                  if (isDashboardDateFilter(filter) && ignoredFilter.type === "dateFilterReference") {
                      return areObjRefsEqual(ignoredFilter.dataSet, filter.dateFilter.dataSet);
                  }

                  if (
                      isDashboardAttributeFilter(filter) &&
                      ignoredFilter.type === "attributeFilterReference"
                  ) {
                      return areObjRefsEqual(ignoredFilter.displayForm, filter.attributeFilter.displayForm);
                  }

                  return false;
              }),
    );
}

function removeFiltersNotPresentOnDashboard(
    effectiveFilters: FilterContextItem[],
    availableDashboardFilters: FilterContextItem[],
) {
    const allFiltersSet = new Set(availableDashboardFilters.map(getFilterLocalIdentifier));

    return effectiveFilters.filter((filter) => {
        return allFiltersSet.has(getFilterLocalIdentifier(filter));
    });
}

function removeDateFiltersIfNotPresentInVisibleFilters(
    effectiveFilters: FilterContextItem[],
    automationToEdit?: IAutomationMetadataObject,
) {
    if (!automationToEdit?.metadata?.visibleFilters) {
        return effectiveFilters;
    }

    const allFiltersSet = new Set(
        automationToEdit.metadata.visibleFilters.map(getMetadataVisibleFilterLocalId),
    );

    return effectiveFilters.filter((filter) => {
        return allFiltersSet.has(getFilterLocalIdentifier(filter));
    });
}

function sanitizeCommonDateFilterDataSet(
    availableDashboardFilters: FilterContextItem[],
    effectiveFilters: FilterContextItem[],
) {
    const dashboardCommonDateFilterLocalId =
        availableDashboardFilters?.find(isDashboardCommonDateFilter)?.dateFilter.localIdentifier;

    return effectiveFilters.map((filter) => {
        if (
            isDashboardDateFilter(filter) &&
            filter.dateFilter.localIdentifier === dashboardCommonDateFilterLocalId
        ) {
            return {
                ...filter,
                dateFilter: {
                    ...filter.dateFilter,
                    dataSet: undefined,
                },
            };
        }

        return filter;
    });
}

function sortFilters(filters: FilterContextItem[]) {
    return filters.sort((a, b) => {
        const filterTypes = [isDashboardCommonDateFilter, isDashboardDateFilter, isDashboardAttributeFilter];

        for (const typeCheck of filterTypes) {
            if (typeCheck(a) && typeCheck(b)) return 0;
            if (typeCheck(a)) return -1;
            if (typeCheck(b)) return 1;
        }

        return 0;
    });
}
