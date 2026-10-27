// (C) 2026 GoodData Corporation

import { type IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import {
    type DashboardAttributeFilterItem,
    type DashboardAttributeFilterSelectionType,
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilter,
    type IDashboardDateFilterConfigItem,
    type IDashboardFilterGroupsConfig,
    type IDashboardMeasureValueFilter,
    type IDashboardMeasureValueFilterConfig,
    type IFilterContextDefinition,
    type ObjRef,
    type ParameterValue,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemFilterElementsBy,
    dashboardAttributeFilterItemFilterElementsByDate,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardAttributeFilterItemValidateElementsBy,
    dashboardFilterLocalIdentifier,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDashboardMatchAttributeFilter,
    isDashboardMeasureValueFilter,
    isSingleSelectionFilter,
} from "@gooddata/sdk-model";

import {
    displayFormsEquivalent,
    findAttributeFilterCounterpart,
} from "../../../utils/attributeFilterMatching.js";
import { effectiveSelectionTypeOf } from "../../../utils/attributeFilterSelectionTypeCompatibility.js";
import { type ITabState } from "../tabsState.js";

import { type WorkingFilterContextItem } from "./filterContextState.js";

type StagedFilter = FilterContextItem | WorkingFilterContextItem;

/**
 * Cross-tab identity match.
 */
export interface IFindCounterpartOptions {
    /**
     * Cross-filtering virtual filters on the target tab are never a counterpart.
     */
    readonly crossFilteringLocalIdsByTab?: CrossFilteringLocalIdsByTab;
}

/**
 * Local identifiers of cross-filtering virtual filters keyed by tab local identifier.
 * Sourced from the drill slice, which reducers of the tabs slice cannot read.
 *
 * @internal
 */
export type CrossFilteringLocalIdsByTab = Readonly<Record<string, readonly string[]>>;

/**
 * True when `localIdentifier` belongs to a cross-filtering virtual filter on `tab`.
 * Those filters are applied on their own tab only and are not mirrored to or from other tabs.
 *
 * @internal
 */
export function isCrossFilteringVirtualFilter(
    tab: ITabState,
    localIdentifier: string | undefined,
    crossFilteringLocalIdsByTab: CrossFilteringLocalIdsByTab | undefined,
): boolean {
    if (!localIdentifier) {
        return false;
    }
    return crossFilteringLocalIdsByTab?.[tab.localIdentifier]?.includes(localIdentifier) ?? false;
}

/**
 * Finds the filter on `targetTab` that is the same logical filter as `sourceFilter`.
 * An attribute filter is a counterpart only when it is of the same type (list or text), has the
 * same display-as label and selection type, both with their defaults applied, and the same single
 * or multiple value selection mode.
 * A missing or incompatible counterpart is a no-op for the caller.
 *
 * Assumes at most one filter per display form, date data set, and measure with a given
 * dimensionality on a tab.
 *
 * @internal
 */
export function findCounterpartFilter(
    sourceTab: ITabState,
    sourceFilter: FilterContextItem,
    targetTab: ITabState,
    attributesWithReferences?: IAttributeWithReferences[],
    options?: IFindCounterpartOptions,
): FilterContextItem | undefined {
    const targets = appliedFilters(targetTab).filter(
        (filter) =>
            !isCrossFilteringVirtualFilter(
                targetTab,
                dashboardFilterLocalIdentifier(filter),
                options?.crossFilteringLocalIdsByTab,
            ),
    );

    if (targets.length === 0) {
        return undefined;
    }

    const displayForms = collectDisplayForms(sourceTab, targetTab, attributesWithReferences);

    if (isDashboardAttributeFilterItem(sourceFilter)) {
        const sourcePresentation = attributeFilterPresentation(sourceTab, sourceFilter);
        const result = findAttributeFilterCounterpart(
            sourceFilter,
            targets
                .filter(isDashboardAttributeFilterItem)
                .filter((target) =>
                    samePresentation(
                        sourcePresentation,
                        attributeFilterPresentation(targetTab, target),
                        displayForms,
                    ),
                ),
            {
                sourceFilterConfigs: sourceTab.attributeFilterConfigs?.attributeFilterConfigs,
                targetFilterConfigs: targetTab.attributeFilterConfigs?.attributeFilterConfigs,
                displayForms,
                attributesWithReferences,
                allowListToText: false,
                allowTextToList: false,
            },
        );
        return result.status === "matched" ? result.counterpart : undefined;
    }
    if (isDashboardDateFilter(sourceFilter)) {
        return findDateCounterpart(sourceFilter, targets);
    }
    if (isDashboardMeasureValueFilter(sourceFilter)) {
        return findMeasureValueCounterpart(sourceFilter, targets);
    }
    return undefined;
}

/**
 * The saved initial filter on `tab` that corresponds to `appliedFilter`.
 * Same-tab `localIdentifier` wins; identity matching is the fallback.
 * Returns undefined when this tab has no saved counterpart.
 *
 * @internal
 */
export function findOriginalFilter(
    tab: ITabState,
    appliedFilter: FilterContextItem,
): FilterContextItem | undefined {
    const originals = tab.filterContext?.originalFilterContextDefinition?.filters;
    if (!originals?.length) {
        return undefined;
    }
    const localIdentifier = dashboardFilterLocalIdentifier(appliedFilter);
    if (localIdentifier) {
        const byLocalId = originals.find(
            (filter) => dashboardFilterLocalIdentifier(filter) === localIdentifier,
        );
        if (byLocalId) {
            return byLocalId;
        }
    }
    if (!tab.filterContext?.originalFilterContextDefinition) {
        return undefined;
    }
    const originalTab: ITabState = {
        ...tab,
        filterContext: {
            ...tab.filterContext,
            filterContextDefinition: tab.filterContext.originalFilterContextDefinition,
        },
    };
    return findCounterpartFilter(tab, appliedFilter, originalTab);
}

/**
 * Rewrites an attribute filter item so it keeps `localIdentifier` (the target tab's id).
 *
 * @internal
 */
export function retargetAttributeFilterItem(
    filter: DashboardAttributeFilterItem,
    localIdentifier: string,
): DashboardAttributeFilterItem {
    if (isDashboardAttributeFilter(filter)) {
        return { attributeFilter: { ...filter.attributeFilter, localIdentifier } };
    }
    if (isDashboardArbitraryAttributeFilter(filter)) {
        return { arbitraryAttributeFilter: { ...filter.arbitraryAttributeFilter, localIdentifier } };
    }
    if (isDashboardMatchAttributeFilter(filter)) {
        return { matchAttributeFilter: { ...filter.matchAttributeFilter, localIdentifier } };
    }
    return filter;
}

/**
 * Carries over parent-filter dependencies from the filter being replaced.
 *
 * @internal
 */
export function preserveFilterDependencies(
    existing: DashboardAttributeFilterItem,
    replacement: DashboardAttributeFilterItem,
): DashboardAttributeFilterItem {
    const filterElementsBy = dashboardAttributeFilterItemFilterElementsBy(existing);
    const filterElementsByDate = dashboardAttributeFilterItemFilterElementsByDate(existing);
    const validateElementsBy = dashboardAttributeFilterItemValidateElementsBy(existing);

    if (!filterElementsBy?.length && !filterElementsByDate?.length && !validateElementsBy?.length) {
        return replacement;
    }

    const preserved = {
        ...(filterElementsBy?.length ? { filterElementsBy } : {}),
        ...(filterElementsByDate?.length ? { filterElementsByDate } : {}),
        ...(validateElementsBy?.length ? { validateElementsBy } : {}),
    };

    if (isDashboardAttributeFilter(replacement)) {
        return { attributeFilter: { ...replacement.attributeFilter, ...preserved } };
    }
    if (isDashboardArbitraryAttributeFilter(replacement)) {
        return { arbitraryAttributeFilter: { ...replacement.arbitraryAttributeFilter, ...preserved } };
    }
    return replacement;
}

/**
 * Copies an applied source filter onto an existing target filter, keeping the target's
 * local identifier, parent dependencies, and measure-value dimensionality. Does not create a filter.
 *
 * @internal
 */
export function applyMirroredFilterValue(
    source: FilterContextItem,
    target: FilterContextItem,
): FilterContextItem {
    if (isDashboardAttributeFilter(source) && isDashboardAttributeFilter(target)) {
        return {
            attributeFilter: {
                ...target.attributeFilter,
                attributeElements: source.attributeFilter.attributeElements,
                negativeSelection: source.attributeFilter.negativeSelection,
            },
        };
    }

    if (isDashboardDateFilter(source) && isDashboardDateFilter(target)) {
        const dateFilter: IDashboardDateFilter["dateFilter"] = {
            ...source.dateFilter,
        };
        if (target.dateFilter.localIdentifier) {
            dateFilter.localIdentifier = target.dateFilter.localIdentifier;
        } else {
            delete dateFilter.localIdentifier;
        }
        if (target.dateFilter.dataSet) {
            dateFilter.dataSet = target.dateFilter.dataSet;
        } else {
            delete dateFilter.dataSet;
        }
        return { dateFilter };
    }

    if (isDashboardMeasureValueFilter(source) && isDashboardMeasureValueFilter(target)) {
        const { measure, localIdentifier, title, dimensionality } = target.dashboardMeasureValueFilter;
        return {
            dashboardMeasureValueFilter: {
                measure,
                localIdentifier,
                ...(title === undefined ? {} : { title }),
                conditions: source.dashboardMeasureValueFilter.conditions,
                ...(dimensionality?.length ? { dimensionality } : {}),
            },
        };
    }

    if (isDashboardAttributeFilterItem(source) && isDashboardAttributeFilterItem(target)) {
        const targetLocalId = dashboardAttributeFilterItemLocalIdentifier(target);
        if (!targetLocalId) {
            return target;
        }
        return preserveFilterDependencies(target, retargetAttributeFilterItem(source, targetLocalId));
    }

    return target;
}

/**
 * Applied filter and parameter values committed on another tab, already fitted to the tab
 * they are written to.
 *
 * @internal
 */
export interface IMirroredSelection {
    readonly filters: readonly FilterContextItem[];
    readonly parameters: readonly IMirroredParameterValue[];
}

/**
 * @internal
 */
export interface IMirroredParameterValue {
    readonly ref: ObjRef;
    readonly value: ParameterValue | undefined;
}

/**
 * Writes `selection` onto the matching applied filters and parameters of `tab`. The tab's own staged
 * value of a written filter or parameter is dropped, so it cannot shadow the written value; staged
 * values of other filters and parameters are kept. Does not create a filter or parameter, except the
 * common date filter, whose absence means all time.
 *
 * @internal
 */
export function writeMirroredSelection(tab: ITabState, selection: IMirroredSelection): void {
    for (const filter of selection.filters) {
        const current = findAppliedFilterWithIdentityOf(tab, filter);
        if (current) {
            writeFilter(tab, current, filter);
        } else if (isDashboardCommonDateFilter(filter)) {
            tab.filterContext?.filterContextDefinition?.filters.unshift(filter);
        } else {
            continue;
        }
        dropStagedOverlay(tab, filter);
    }

    for (const { ref, value } of selection.parameters) {
        const entry = tab.parameters?.parameters.find((candidate) =>
            areObjRefsEqual(candidate.parameter.ref, ref),
        );
        if (!entry) {
            continue;
        }
        delete entry.workingOverride;
        entry.runtimeOverride = value;
    }
}

/**
 * The applied filter of `tab` that a staged entry overlays.
 *
 * @internal
 */
export function findAppliedFilterForStaged(
    tab: ITabState,
    staged: StagedFilter,
): FilterContextItem | undefined {
    const filters = appliedFilters(tab);
    if ("dateFilter" in staged && staged.dateFilter) {
        if (!staged.dateFilter.dataSet) {
            return filters.find(isDashboardCommonDateFilter);
        }
        return filters.find(
            (filter) =>
                isDashboardDateFilter(filter) &&
                areObjRefsEqual(filter.dateFilter.dataSet, staged.dateFilter.dataSet),
        );
    }
    const localIdentifier = stagedLocalIdentifier(staged);
    if (!localIdentifier) {
        return undefined;
    }
    return filters.find((filter) => dashboardFilterLocalIdentifier(filter) === localIdentifier);
}

/**
 * Filter state of a tab created while sync is on.
 *
 * @internal
 */
export interface ISyncedTabSeed {
    readonly filterContextDefinition: IFilterContextDefinition;
    readonly attributeFilterDisplayForms: IAttributeDisplayFormMetadataObject[];
    readonly attributeFilterConfigs: IDashboardAttributeFilterConfig[];
    readonly dateFilterConfigs: IDashboardDateFilterConfigItem[];
    readonly measureValueFilterConfigs: IDashboardMeasureValueFilterConfig[];
    readonly filterGroupsConfig: IDashboardFilterGroupsConfig | undefined;
}

/**
 * Seeds a new tab with the applied filters of `sourceTab` and the configs that belong to them,
 * so every synced filter has a counterpart on the new tab. Cross-filtering virtual filters stay
 * on their own tab. `base` provides the title and description of the new filter context.
 *
 * @internal
 */
export function seedSyncedTabFilters(
    sourceTab: ITabState,
    base: IFilterContextDefinition,
    crossFilteringLocalIdsByTab?: CrossFilteringLocalIdsByTab,
): ISyncedTabSeed {
    const filters = appliedFilters(sourceTab).filter(
        (filter) =>
            !isCrossFilteringVirtualFilter(
                sourceTab,
                dashboardFilterLocalIdentifier(filter),
                crossFilteringLocalIdsByTab,
            ),
    );
    const localIds = new Set(
        filters.map(dashboardFilterLocalIdentifier).filter((id): id is string => id !== undefined),
    );
    const dateDataSets = filters
        .filter(isDashboardDateFilter)
        .map((filter) => filter.dateFilter.dataSet)
        .filter((ref): ref is ObjRef => ref !== undefined);

    const groups = (sourceTab.filterGroupsConfig?.groups ?? [])
        .map((group) => ({
            ...group,
            filters: group.filters.filter((item) => localIds.has(item.filterLocalIdentifier)),
        }))
        .filter((group) => group.filters.length > 0);

    return {
        filterContextDefinition: { ...base, filters },
        attributeFilterDisplayForms: sourceTab.filterContext?.attributeFilterDisplayForms ?? [],
        attributeFilterConfigs: (sourceTab.attributeFilterConfigs?.attributeFilterConfigs ?? []).filter(
            (config) => localIds.has(config.localIdentifier),
        ),
        dateFilterConfigs: (sourceTab.dateFilterConfigs?.dateFilterConfigs ?? []).filter((config) =>
            dateDataSets.some((ref) => areObjRefsEqual(ref, config.dateDataSet)),
        ),
        measureValueFilterConfigs: (
            sourceTab.measureValueFilterConfigs?.measureValueFilterConfigs ?? []
        ).filter((config) => localIds.has(config.localIdentifier)),
        filterGroupsConfig: groups.length > 0 ? { groups } : undefined,
    };
}

function writeFilter(tab: ITabState, current: FilterContextItem, next: FilterContextItem): void {
    const filters = tab.filterContext?.filterContextDefinition?.filters;
    if (!filters) {
        return;
    }
    const index = filters.indexOf(current);
    if (index < 0) {
        return;
    }
    filters[index] = next;
}

/**
 * Removes the working entries that `applyFilterContext` would overlay on `applied`.
 */
function dropStagedOverlay(tab: ITabState, applied: FilterContextItem): void {
    const filterContext = tab.filterContext;
    const working = filterContext?.workingFilterContextDefinition;
    if (!filterContext || !working?.filters.length) {
        return;
    }
    const overlays = isDashboardDateFilter(applied)
        ? (item: StagedFilter) =>
              "dateFilter" in item &&
              !!item.dateFilter &&
              (areObjRefsEqual(item.dateFilter.dataSet, applied.dateFilter.dataSet) ||
                  (!item.dateFilter.dataSet && !applied.dateFilter.dataSet))
        : (item: StagedFilter) =>
              !("dateFilter" in item) &&
              stagedLocalIdentifier(item) !== undefined &&
              stagedLocalIdentifier(item) === dashboardFilterLocalIdentifier(applied);
    const remaining = working.filters.filter((item) => !overlays(item));
    if (remaining.length !== working.filters.length) {
        filterContext.workingFilterContextDefinition = { filters: remaining };
    }
}

function findAppliedFilterWithIdentityOf(
    tab: ITabState,
    filter: FilterContextItem,
): FilterContextItem | undefined {
    if (isDashboardDateFilter(filter)) {
        return findDateCounterpart(filter, appliedFilters(tab));
    }
    const localIdentifier = dashboardFilterLocalIdentifier(filter);
    return localIdentifier
        ? appliedFilters(tab).find((item) => dashboardFilterLocalIdentifier(item) === localIdentifier)
        : undefined;
}

function stagedLocalIdentifier(item: StagedFilter): string | undefined {
    if ("attributeFilter" in item && item.attributeFilter) {
        return item.attributeFilter.localIdentifier;
    }
    if ("arbitraryAttributeFilter" in item && item.arbitraryAttributeFilter) {
        return item.arbitraryAttributeFilter.localIdentifier;
    }
    if ("matchAttributeFilter" in item && item.matchAttributeFilter) {
        return item.matchAttributeFilter.localIdentifier;
    }
    if ("dateFilter" in item && item.dateFilter) {
        return item.dateFilter.localIdentifier;
    }
    if ("dashboardMeasureValueFilter" in item && item.dashboardMeasureValueFilter) {
        return item.dashboardMeasureValueFilter.localIdentifier;
    }
    return undefined;
}

function appliedFilters(tab: ITabState): FilterContextItem[] {
    return tab.filterContext?.filterContextDefinition?.filters ?? [];
}

function collectDisplayForms(
    sourceTab: ITabState,
    targetTab: ITabState,
    attributesWithReferences?: IAttributeWithReferences[],
): IAttributeDisplayFormMetadataObject[] {
    return [
        ...(sourceTab.filterContext?.attributeFilterDisplayForms ?? []),
        ...(targetTab.filterContext?.attributeFilterDisplayForms ?? []),
        ...(attributesWithReferences ?? []).flatMap((entry) => entry.attribute.displayForms ?? []),
    ];
}

interface IAttributeFilterPresentation {
    readonly displayAsLabel: ObjRef;
    readonly selectionType: DashboardAttributeFilterSelectionType;
    readonly isSingleSelection: boolean;
}

function attributeFilterPresentation(
    tab: ITabState,
    filter: DashboardAttributeFilterItem,
): IAttributeFilterPresentation {
    const localIdentifier = dashboardAttributeFilterItemLocalIdentifier(filter);
    const config = localIdentifier
        ? tab.attributeFilterConfigs?.attributeFilterConfigs?.find(
              (item) => item.localIdentifier === localIdentifier,
          )
        : undefined;
    return {
        displayAsLabel: config?.displayAsLabel ?? dashboardAttributeFilterItemDisplayForm(filter),
        selectionType: effectiveSelectionTypeOf(config?.selectionType, filter),
        isSingleSelection: isDashboardAttributeFilter(filter) && isSingleSelectionFilter(filter),
    };
}

/**
 * Attribute filters sync only when they show the same label, accept the same selection type
 * and both select either a single value or multiple values.
 */
function samePresentation(
    left: IAttributeFilterPresentation,
    right: IAttributeFilterPresentation,
    displayForms: IAttributeDisplayFormMetadataObject[],
): boolean {
    return (
        left.selectionType === right.selectionType &&
        left.isSingleSelection === right.isSingleSelection &&
        displayFormsEquivalent(left.displayAsLabel, right.displayAsLabel, displayForms)
    );
}

function findDateCounterpart(
    sourceFilter: IDashboardDateFilter,
    targets: FilterContextItem[],
): IDashboardDateFilter | undefined {
    // Check the data set directly. `isDashboardCommonDateFilter` is typed as
    // `obj is IDashboardDateFilter`, so using it as a guard would narrow the
    // remaining source to `never`.
    const dataSet = sourceFilter.dateFilter.dataSet;
    if (!dataSet) {
        return targets.find(isDashboardCommonDateFilter);
    }
    return targets.find(
        (filter): filter is IDashboardDateFilter =>
            isDashboardDateFilter(filter) && areObjRefsEqual(filter.dateFilter.dataSet, dataSet),
    );
}

function findMeasureValueCounterpart(
    sourceFilter: IDashboardMeasureValueFilter,
    targets: FilterContextItem[],
): IDashboardMeasureValueFilter | undefined {
    return targets
        .filter(isDashboardMeasureValueFilter)
        .find(
            (filter) =>
                areObjRefsEqual(
                    filter.dashboardMeasureValueFilter.measure,
                    sourceFilter.dashboardMeasureValueFilter.measure,
                ) &&
                dimensionalityCompatible(
                    filter.dashboardMeasureValueFilter.dimensionality,
                    sourceFilter.dashboardMeasureValueFilter.dimensionality,
                ),
        );
}

/**
 * A measure value filter syncs only with a filter on the same measure and the same dimensionality.
 * Missing dimensionality matches only another missing dimensionality.
 */
function dimensionalityCompatible(left: ObjRef[] | undefined, right: ObjRef[] | undefined): boolean {
    const leftRefs = left ?? [];
    const rightRefs = right ?? [];
    if (leftRefs.length !== rightRefs.length) {
        return false;
    }
    return leftRefs.every((ref, index) => areObjRefsEqual(ref, rightRefs[index]));
}
