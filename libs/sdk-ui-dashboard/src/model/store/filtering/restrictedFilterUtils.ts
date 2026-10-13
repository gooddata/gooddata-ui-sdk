// (C) 2026 GoodData Corporation

import type { IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type ObjRef,
    type ObjectType,
    areObjRefsEqual,
    dashboardAttributeFilterItemFilterElementsBy,
    dashboardAttributeFilterItemValidateElementsBy,
    dashboardFilterLocalIdentifier,
    dashboardFilterObjRef,
    isComputedAttributeRef,
    isDashboardAttributeFilterItem,
    isDashboardMeasureValueFilter,
    isIdentifierRef,
} from "@gooddata/sdk-model";

export function isDashboardObjectRestricted(
    ref: ObjRef,
    type: ObjectType,
    unavailableObjects: ReadonlyArray<IUnavailableDashboardReference>,
): boolean {
    return unavailableObjects.some(
        (object) => object.reason === "forbidden" && object.type === type && areObjRefsEqual(object.ref, ref),
    );
}

function dashboardFilterObjectType(filter: FilterContextItem): ObjectType | undefined {
    if (isDashboardAttributeFilterItem(filter)) {
        return isComputedAttributeRef(dashboardFilterObjRef(filter)) ? "computedAttribute" : "displayForm";
    }
    if (isDashboardMeasureValueFilter(filter)) {
        return "measure";
    }
    return undefined;
}

/**
 * Tells whether a configuration item is a forbidden object. The item's type is unknown here, so any
 * forbidden object with an equal ref matches; a typed identifier ref also has to agree on the type.
 */
function isConfigurationRefRestricted(
    ref: ObjRef,
    unavailableObjects: ReadonlyArray<IUnavailableDashboardReference>,
): boolean {
    const type = isIdentifierRef(ref) ? ref.type : undefined;
    return unavailableObjects.some(
        (object) =>
            object.reason === "forbidden" &&
            (type === undefined || object.type === type) &&
            areObjRefsEqual(object.ref, ref),
    );
}

/**
 * The items a filter's configuration computes with besides the object it filters by: the "For attribute"
 * (dimensionality) items of a measure value filter, and the "Filter values by" items of an attribute
 * filter (a metric, a fact, or the attribute of "Count of").
 */
function dashboardFilterConfigurationRefs(filter: FilterContextItem): ObjRef[] {
    if (isDashboardMeasureValueFilter(filter)) {
        return filter.dashboardMeasureValueFilter.dimensionality ?? [];
    }
    if (isDashboardAttributeFilterItem(filter)) {
        return dashboardAttributeFilterItemValidateElementsBy(filter) ?? [];
    }
    return [];
}

/**
 * Tells whether the filter itself uses an object the user may not read: the object it filters by, or an
 * item of its configuration ("For attribute", "Filter values by").
 *
 * @remarks
 * A filter is also restricted when its parent filter is, see {@link getRestrictedDashboardFilters}.
 */
export function isDashboardFilterUsingRestrictedObject(
    filter: FilterContextItem,
    unavailableObjects: ReadonlyArray<IUnavailableDashboardReference>,
): boolean {
    const ref = dashboardFilterObjRef(filter);
    const type = dashboardFilterObjectType(filter);

    return (
        (ref !== undefined &&
            type !== undefined &&
            isDashboardObjectRestricted(ref, type, unavailableObjects)) ||
        dashboardFilterConfigurationRefs(filter).some((item) =>
            isConfigurationRefRestricted(item, unavailableObjects),
        )
    );
}

/**
 * Returns the filters the user may not use, in their order: the dashboard hides them, reports them as
 * restricted and leaves them out of every execution, export and automation.
 *
 * @remarks
 * A filter is restricted when it uses an object the user may not read
 * ({@link isDashboardFilterUsingRestrictedObject}) or when any of its parent filters is restricted:
 * its values depend on the parent's selection, which the user may not see. Restriction flows from a
 * parent to its children, never the other way.
 */
export function getRestrictedDashboardFilters(
    filters: FilterContextItem[],
    unavailableObjects: ReadonlyArray<IUnavailableDashboardReference>,
): FilterContextItem[] {
    const restricted = new Set(
        filters.filter((filter) => isDashboardFilterUsingRestrictedObject(filter, unavailableObjects)),
    );
    // each pass adds the children of the filters restricted so far; a pass that adds none ends the
    // walk, also when the parent links form a cycle
    let added = restricted.size > 0;
    while (added) {
        const restrictedLocalIdentifiers = new Set(Array.from(restricted, dashboardFilterLocalIdentifier));
        const children = filters.filter(
            (filter) =>
                !restricted.has(filter) &&
                isDashboardAttributeFilterItem(filter) &&
                (dashboardAttributeFilterItemFilterElementsBy(filter) ?? []).some((parent) =>
                    restrictedLocalIdentifiers.has(parent.filterLocalIdentifier),
                ),
        );
        children.forEach((child) => restricted.add(child));
        added = children.length > 0;
    }

    return filters.filter((filter) => restricted.has(filter));
}

/**
 * Tells whether a filter taken out of the filter context (a command payload, a stored automation) is
 * restricted: it uses a restricted object, its local identifier names a restricted filter of the
 * dashboard, or one of its own parent links does (a stored copy may keep a parent the dashboard has
 * dropped since).
 */
export function isDashboardFilterCopyRestricted(
    filter: FilterContextItem,
    restrictedLocalIdentifiers: ReadonlySet<string>,
    unavailableObjects: ReadonlyArray<IUnavailableDashboardReference>,
): boolean {
    return (
        isDashboardFilterUsingRestrictedObject(filter, unavailableObjects) ||
        restrictedLocalIdentifiers.has(dashboardFilterLocalIdentifier(filter) ?? "") ||
        (isDashboardAttributeFilterItem(filter) &&
            (dashboardAttributeFilterItemFilterElementsBy(filter) ?? []).some((parent) =>
                restrictedLocalIdentifiers.has(parent.filterLocalIdentifier),
            ))
    );
}
