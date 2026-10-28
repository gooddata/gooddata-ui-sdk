// (C) 2021-2026 GoodData Corporation

import { uniqBy } from "lodash-es";

import {
    type IAttributeWithReferences,
    type IUnavailableDashboardReference,
} from "@gooddata/sdk-backend-spi";
import {
    type IDashboard,
    type ObjRef,
    isDashboardAttributeFilter,
    objRefToString,
} from "@gooddata/sdk-model";

import { isDashboardObjectRestricted } from "../../../store/filtering/restrictedFilterUtils.js";
import { type DashboardContext } from "../../../types/commonTypes.js";

export function preloadAttributeFiltersData(
    ctx: DashboardContext,
    dashboard?: IDashboard,
    unavailableObjects: IUnavailableDashboardReference[] = [],
): Promise<IAttributeWithReferences[]> {
    return loadAttributesWithReferences(ctx, attributeFilterDisplayFormRefs(dashboard, unavailableObjects));
}

export function loadAttributesWithReferences(
    ctx: DashboardContext,
    refs: ObjRef[],
): Promise<IAttributeWithReferences[]> {
    if (!refs.length) {
        return Promise.resolve([]);
    }

    const { backend, workspace } = ctx;
    return backend.workspace(workspace).attributes().getAttributesWithReferences(refs);
}

/**
 * The unique display forms of the attribute filters of the dashboard and its tabs that the user can read.
 */
export function attributeFilterDisplayFormRefs(
    dashboard?: IDashboard,
    unavailableObjects: IUnavailableDashboardReference[] = [],
): ObjRef[] {
    const dashboardAttributeFilterRefs = dashboard?.filterContext?.filters
        .filter(isDashboardAttributeFilter)
        .map((filter) => filter.attributeFilter.displayForm);

    const tabsAttributeFilterRefs = dashboard?.tabs?.reduce((acc, tab) => {
        const refs = tab.filterContext?.filters
            .filter(isDashboardAttributeFilter)
            .map((filter) => filter.attributeFilter.displayForm);
        return [...acc, ...(refs ?? [])];
    }, [] as ObjRef[]);

    const allRefs = [...(dashboardAttributeFilterRefs ?? []), ...(tabsAttributeFilterRefs ?? [])].filter(
        (ref) => !isDashboardObjectRestricted(ref, "displayForm", unavailableObjects),
    );

    // Remove duplicates by comparing ObjRef string representations
    return uniqBy(allRefs, objRefToString);
}
