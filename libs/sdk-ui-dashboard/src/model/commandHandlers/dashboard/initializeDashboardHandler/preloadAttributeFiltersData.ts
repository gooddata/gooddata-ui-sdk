// (C) 2021-2025 GoodData Corporation

import { IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import { IDashboard, ObjRef, isDashboardAttributeFilter } from "@gooddata/sdk-model";

import { DashboardContext } from "../../../types/commonTypes.js";

export function preloadAttributeFiltersData(
    ctx: DashboardContext,
    dashboard?: IDashboard,
): Promise<IAttributeWithReferences[]> {
    const { backend, workspace } = ctx;
    const dashboardAttributeFilterRefs = dashboard?.filterContext?.filters
        .filter(isDashboardAttributeFilter)
        .map((filter) => filter.attributeFilter.displayForm);

    const tabsAttributeFilterRefs = dashboard?.tabs?.reduce((acc, tab) => {
        const refs = tab.filterContext?.filters
            .filter(isDashboardAttributeFilter)
            .map((filter) => filter.attributeFilter.displayForm);
        return [...acc, ...(refs ?? [])];
    }, [] as ObjRef[]);

    const attributeFilterRefs = [...(dashboardAttributeFilterRefs ?? []), ...(tabsAttributeFilterRefs ?? [])];

    if (!attributeFilterRefs?.length) {
        return Promise.resolve([]);
    }

    return backend.workspace(workspace).attributes().getAttributesWithReferences(attributeFilterRefs);
}
