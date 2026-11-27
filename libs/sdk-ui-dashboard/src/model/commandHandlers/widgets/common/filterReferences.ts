// (C) 2026 GoodData Corporation

import {
    type DashboardAttributeFilterItem,
    type DashboardDateFilterOfAnyType,
    type IDashboardAttributeFilterReference,
    type IDashboardDateFilterReference,
    type IDashboardFilterReference,
    type IDashboardMeasureValueFilter,
    type IDashboardMeasureValueFilterReference,
    dashboardAttributeFilterItemDisplayForm,
    dashboardFilterObjRef,
    isDashboardAttributeFilterItem,
    isDashboardMeasureValueFilter,
} from "@gooddata/sdk-model";

/**
 * Converts filters to references.
 * @param filters - filters to convert to references
 * @returns references to the filters
 */
export function toDashboardFilterReferences(
    filters?: Array<
        DashboardAttributeFilterItem | DashboardDateFilterOfAnyType | IDashboardMeasureValueFilter
    >,
): IDashboardFilterReference[] | undefined {
    return filters?.map((filter) => {
        if (isDashboardAttributeFilterItem(filter)) {
            const filterReference: IDashboardAttributeFilterReference = {
                type: "attributeFilterReference",
                displayForm: dashboardAttributeFilterItemDisplayForm(filter),
            };

            return filterReference;
        }
        if (isDashboardMeasureValueFilter(filter)) {
            const filterReference: IDashboardMeasureValueFilterReference = {
                type: "measureValueFilterReference",
                measure: dashboardFilterObjRef(filter)!,
            };

            return filterReference;
        }
        const filterReference: IDashboardDateFilterReference = {
            type: "dateFilterReference",
            dataSet: dashboardFilterObjRef(filter)!,
        };

        return filterReference;
    });
}
