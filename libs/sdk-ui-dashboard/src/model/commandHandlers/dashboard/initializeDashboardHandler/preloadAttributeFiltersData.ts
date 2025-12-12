// (C) 2021-2025 GoodData Corporation

import { uniqBy } from "lodash-es";

import { type IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import {
    type IDashboard,
    type ObjRef,
    isDashboardAttributeFilter,
    objRefToString,
} from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";

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

    const allRefs = [...(dashboardAttributeFilterRefs ?? []), ...(tabsAttributeFilterRefs ?? [])];

    // Remove duplicates by comparing ObjRef string representations
    const uniqueRefs = uniqBy(allRefs, objRefToString);

    if (!uniqueRefs?.length) {
        return Promise.resolve([]);
    }

    return backend.workspace(workspace).attributes().getAttributesWithReferences(uniqueRefs);
}
