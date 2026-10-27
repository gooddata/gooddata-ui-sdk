// (C) 2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";

import {
    type FilterContextItem,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type IDashboardMeasureValueFilter,
    type ObjRef,
    areObjRefsEqual,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardFilterLocalIdentifier,
    isAllTimeDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDashboardDateFilterWithDimension,
    isDashboardMeasureValueFilter,
    isNoopAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { type IUpsertDateFilterPayload } from "../../../store/tabs/filterContext/filterContextReducers.js";
import {
    type IMirroredParameterValue,
    applyMirroredFilterValue,
    findAppliedFilterForStaged,
    findCounterpartFilter,
    findOriginalFilter,
    isCrossFilteringVirtualFilter,
    retargetAttributeFilterItem,
} from "../../../store/tabs/filterContext/filterSync.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type ITabState } from "../../../store/tabs/tabsState.js";

import { type ITabSyncRuleContext, type TabSyncActionsRule, type TabSyncRule } from "./tabSyncScope.js";

type AnyTabSyncRule = TabSyncActionsRule<any>;

type PayloadActionCreatorLike = ((payload: any) => PayloadAction<any>) & { readonly type: string };

function defineRule<C extends PayloadActionCreatorLike>(
    actionCreator: C,
    rule: TabSyncRule<Parameters<C>[0]>,
): [string, AnyTabSyncRule] {
    return defineActionsRule(actionCreator, (payload, target, ctx) => {
        const targetPayload = rule(payload, target, ctx);
        return targetPayload ? [actionCreator(targetPayload)] : [];
    });
}

function defineActionsRule<C extends PayloadActionCreatorLike>(
    actionCreator: C,
    rule: TabSyncActionsRule<Parameters<C>[0]>,
): [string, AnyTabSyncRule] {
    return [actionCreator.type, rule];
}

//
// Shared lookups
//

function filtersOf(tab: ITabState): FilterContextItem[] {
    return tab.filterContext?.filterContextDefinition?.filters ?? [];
}

function findFilterByLocalId(tab: ITabState, localIdentifier: string): FilterContextItem | undefined {
    return filtersOf(tab).find((item) => dashboardFilterLocalIdentifier(item) === localIdentifier);
}

function findCounterpartOf(
    ctx: ITabSyncRuleContext,
    sourceTab: ITabState,
    sourceFilter: FilterContextItem,
    target: ITabState,
): FilterContextItem | undefined {
    const { crossFilteringLocalIdsByTab } = ctx.scope;
    if (
        isCrossFilteringVirtualFilter(
            sourceTab,
            dashboardFilterLocalIdentifier(sourceFilter),
            crossFilteringLocalIdsByTab,
        )
    ) {
        return undefined;
    }
    return findCounterpartFilter(sourceTab, sourceFilter, target, ctx.state.attributesWithReferences, {
        crossFilteringLocalIdsByTab,
    });
}

/**
 * The filter on `target` that is the same logical filter as the source tab filter `sourceLocalId`.
 * Cross-filtering virtual filters have no counterpart.
 */
function findCounterpart(
    ctx: ITabSyncRuleContext,
    target: ITabState,
    sourceLocalId: string,
): FilterContextItem | undefined {
    const sourceFilter = findFilterByLocalId(ctx.source, sourceLocalId);
    return sourceFilter ? findCounterpartOf(ctx, ctx.source, sourceFilter, target) : undefined;
}

function counterpartLocalId(
    ctx: ITabSyncRuleContext,
    target: ITabState,
    sourceLocalId: string,
): string | undefined {
    const counterpart = findCounterpart(ctx, target, sourceLocalId);
    return counterpart ? dashboardFilterLocalIdentifier(counterpart) : undefined;
}

function findDimensionDateFilter(tab: ITabState, dataSet: ObjRef): IDashboardDateFilter | undefined {
    return filtersOf(tab).find(
        (item): item is IDashboardDateFilter =>
            isDashboardDateFilterWithDimension(item) && areObjRefsEqual(item.dateFilter.dataSet, dataSet),
    );
}

//
// Selection
//

function findSelectionCounterpart(
    ctx: ITabSyncRuleContext,
    target: ITabState,
    sourceLocalId: string,
): IDashboardAttributeFilter | undefined {
    const sourceFilter = findFilterByLocalId(ctx.source, sourceLocalId);
    if (!isDashboardAttributeFilter(sourceFilter)) {
        return undefined;
    }
    const counterpart = findCounterpartOf(ctx, ctx.source, sourceFilter, target);
    return isDashboardAttributeFilter(counterpart) && counterpart.attributeFilter.localIdentifier
        ? counterpart
        : undefined;
}

function findMeasureValueCounterpart(
    ctx: ITabSyncRuleContext,
    target: ITabState,
    sourceLocalId: string,
): IDashboardMeasureValueFilter | undefined {
    const sourceFilter = findFilterByLocalId(ctx.source, sourceLocalId);
    if (!isDashboardMeasureValueFilter(sourceFilter)) {
        return undefined;
    }
    const counterpart = findCounterpartOf(ctx, ctx.source, sourceFilter, target);
    return isDashboardMeasureValueFilter(counterpart) ? counterpart : undefined;
}

function findAppliedDateFilter(
    tab: ITabState,
    dataSet: ObjRef | undefined,
): IDashboardDateFilter | undefined {
    return dataSet ? findDimensionDateFilter(tab, dataSet) : filtersOf(tab).find(isDashboardCommonDateFilter);
}

function toUpsertDateFilterPayload(filter: IDashboardDateFilter): IUpsertDateFilterPayload {
    const { dataSet, localIdentifier, emptyValueHandling, boundedFilter, type, granularity, from, to } =
        filter.dateFilter;
    const shared = {
        ...(dataSet ? { dataSet } : {}),
        ...(localIdentifier ? { localIdentifier } : {}),
        ...(emptyValueHandling ? { emptyValueHandling } : {}),
    };
    if (isAllTimeDashboardDateFilter(filter)) {
        return { type: "allTime", ...shared };
    }
    return { type, granularity, from, to, ...(boundedFilter ? { boundedFilter } : {}), ...shared };
}

/**
 * Saved date filter of `target`. A common date filter without a saved original is all time, which is
 * stored as the absence of the filter. A dimension date filter without a saved original is left unchanged.
 */
function savedDateFilterPayload(
    target: ITabState,
    applied: IDashboardDateFilter | undefined,
    dataSet: ObjRef | undefined,
): IUpsertDateFilterPayload | undefined {
    const original = findOriginalFilter(
        target,
        applied ?? { dateFilter: { type: "relative", granularity: "GDC.time.date" } },
    );
    if (isDashboardDateFilter(original)) {
        return toUpsertDateFilterPayload(original);
    }
    return dataSet ? undefined : { type: "allTime" };
}

function committedParameterValues(ctx: ITabSyncRuleContext, target: ITabState): IMirroredParameterValue[] {
    const stagedRefs = (ctx.source.parameters?.parameters ?? [])
        .filter((entry) => entry.workingOverride !== undefined)
        .map((entry) => entry.parameter.ref);
    return stagedRefs.flatMap((ref) => {
        const committed = ctx.sourceAfter.parameters?.parameters.find((entry) =>
            areObjRefsEqual(entry.parameter.ref, ref),
        );
        const definedOnTarget = target.parameters?.parameters.some((entry) =>
            areObjRefsEqual(entry.parameter.ref, ref),
        );
        return committed && definedOnTarget ? [{ ref, value: committed.runtimeOverride }] : [];
    });
}

function committedFilterValues(ctx: ITabSyncRuleContext, target: ITabState): FilterContextItem[] {
    const staged = ctx.source.filterContext?.workingFilterContextDefinition?.filters ?? [];
    return staged.flatMap((item): FilterContextItem[] => {
        const committed = findAppliedFilterForStaged(ctx.sourceAfter, item);
        if (!committed) {
            return [];
        }
        const counterpart = findCounterpartOf(ctx, ctx.sourceAfter, committed, target);
        if (counterpart) {
            return [applyMirroredFilterValue(committed, counterpart)];
        }
        // A tab without a common date filter is all time, so it receives the committed value
        // without the local identifier of the source.
        if (!isDashboardCommonDateFilter(committed) || isNoopAllTimeDashboardDateFilter(committed)) {
            return [];
        }
        const { localIdentifier: _sourceLocalIdentifier, ...dateFilter } = committed.dateFilter;
        return [{ dateFilter }];
    });
}

//
// Rules
//

const filterContextRules: Array<[string, AnyTabSyncRule]> = [
    defineRule(tabsActions.addAttributeFilterDisplayForm, (payload, target) => {
        if (!target.filterContext?.attributeFilterDisplayForms) {
            return undefined;
        }
        return { displayForm: "displayForm" in payload ? payload.displayForm : payload };
    }),

    // Selection changes swap the display form together with elements expressed in it, so the swap
    // follows the selection. Filter configuration handlers do not sync these actions.
    // A tab that shows its display form as its label keeps showing it as its display-as label.
    // With `restoreTargetOriginal`, every tab restores its own saved labels.
    defineActionsRule(tabsActions.changeAttributeDisplayForm, (payload, target, ctx) => {
        // Staged edits stay on their tab until applied; every tab migrates its own filters.
        if (payload.isWorkingSelectionChange || payload.isResultOfMigration) {
            return [];
        }
        const counterpart = findCounterpart(ctx, target, payload.filterLocalId);
        if (!isDashboardAttributeFilter(counterpart)) {
            return [];
        }
        const filterLocalId = dashboardFilterLocalIdentifier(counterpart)!;
        if (!payload.restoreTargetOriginal) {
            const changeDisplayForm = tabsActions.changeAttributeDisplayForm({ ...payload, filterLocalId });
            const currentDisplayForm = counterpart.attributeFilter.displayForm;
            const hasDisplayAsLabel = target.attributeFilterConfigs?.attributeFilterConfigs?.some(
                (config) => config.localIdentifier === filterLocalId && config.displayAsLabel,
            );
            if (hasDisplayAsLabel || areObjRefsEqual(currentDisplayForm, payload.displayForm)) {
                return [changeDisplayForm];
            }
            return [
                changeDisplayForm,
                tabsActions.changeDisplayAsLabel({
                    localIdentifier: filterLocalId,
                    displayAsLabel: currentDisplayForm,
                }),
            ];
        }
        const original = findOriginalFilter(target, counterpart);
        if (
            !isDashboardAttributeFilter(original) ||
            areObjRefsEqual(original.attributeFilter.displayForm, counterpart.attributeFilter.displayForm)
        ) {
            return [];
        }
        return [
            tabsActions.changeAttributeDisplayForm({
                ...payload,
                filterLocalId,
                displayForm: original.attributeFilter.displayForm,
            }),
        ];
    }),
    // A display-as label is filter configuration, which stays on its tab. Only a reset is mirrored,
    // so that every tab restores its own saved label.
    defineRule(tabsActions.changeDisplayAsLabel, (payload, target, ctx) => {
        if (!payload.restoreTargetOriginal) {
            return undefined;
        }
        const localIdentifier = counterpartLocalId(ctx, target, payload.localIdentifier);
        if (!localIdentifier) {
            return undefined;
        }
        const savedConfigs = ctx.scope.persistedAttributeFilterConfigsByTab?.[target.localIdentifier];
        if (!savedConfigs) {
            return undefined;
        }
        const displayAsLabel = savedConfigs.find(
            (config) => config.localIdentifier === localIdentifier,
        )?.displayAsLabel;
        const currentDisplayAsLabel = target.attributeFilterConfigs?.attributeFilterConfigs?.find(
            (config) => config.localIdentifier === localIdentifier,
        )?.displayAsLabel;
        return areObjRefsEqual(displayAsLabel, currentDisplayAsLabel)
            ? undefined
            : { ...payload, localIdentifier, displayAsLabel };
    }),
];

// Staged edits stay on their tab until applied. With `restoreTargetOriginal`, every tab restores its own saved value.
const selectionRules: Array<[string, AnyTabSyncRule]> = [
    defineRule(tabsActions.updateAttributeFilterSelection, (payload, target, ctx) => {
        // Every tab migrates its own filters, so a migrated selection stays on its tab.
        if (payload.isWorkingSelectionChange || payload.isResultOfMigration) {
            return undefined;
        }
        const counterpart = findSelectionCounterpart(ctx, target, payload.filterLocalId);
        if (!counterpart) {
            return undefined;
        }
        const original = payload.restoreTargetOriginal ? findOriginalFilter(target, counterpart) : undefined;
        if (payload.restoreTargetOriginal && !isDashboardAttributeFilter(original)) {
            return undefined;
        }
        return {
            ...payload,
            filterLocalId: counterpart.attributeFilter.localIdentifier!,
            ...(isDashboardAttributeFilter(original)
                ? {
                      elements: original.attributeFilter.attributeElements,
                      negativeSelection: original.attributeFilter.negativeSelection,
                  }
                : {}),
            // Every tab migrates its own filters.
            enableImmediateAttributeFilterDisplayAsLabelMigration: false,
        };
    }),
    defineRule(tabsActions.replaceAttributeFilterItem, (payload, target, ctx) => {
        if (payload.isWorkingSelectionChange) {
            return undefined;
        }
        const sourceFilter = findFilterByLocalId(ctx.source, payload.filterLocalId);
        if (!isDashboardAttributeFilterItem(sourceFilter)) {
            return undefined;
        }
        const counterpart = findCounterpartOf(ctx, ctx.source, sourceFilter, target);
        if (!isDashboardAttributeFilterItem(counterpart)) {
            return undefined;
        }
        const filterLocalId = dashboardAttributeFilterItemLocalIdentifier(counterpart);
        if (!filterLocalId) {
            return undefined;
        }
        const original = payload.restoreTargetOriginal ? findOriginalFilter(target, counterpart) : undefined;
        if (payload.restoreTargetOriginal && !isDashboardAttributeFilterItem(original)) {
            return undefined;
        }
        const replacement = isDashboardAttributeFilterItem(original) ? original : payload.filter;
        return { ...payload, filterLocalId, filter: retargetAttributeFilterItem(replacement, filterLocalId) };
    }),
    defineRule(tabsActions.clearAttributeFiltersSelection, (payload, target, ctx) => {
        const filterLocalIds = payload.filterLocalIds.flatMap((filterLocalId) => {
            const counterpart = findSelectionCounterpart(ctx, target, filterLocalId);
            return counterpart ? [counterpart.attributeFilter.localIdentifier!] : [];
        });
        if (filterLocalIds.length === 0) {
            return undefined;
        }
        return { filterLocalIds, ...(payload.restoreTargetOriginal ? { restoreOriginal: true } : {}) };
    }),
    defineRule(tabsActions.upsertDateFilter, (payload, target) => {
        if (payload.isWorkingSelectionChange || !target.filterContext?.filterContextDefinition) {
            return undefined;
        }
        const counterpart = findAppliedDateFilter(target, payload.dataSet);
        // A common date filter always has a counterpart: all time is stored as its absence.
        if (!counterpart && payload.dataSet) {
            return undefined;
        }
        const value = payload.restoreTargetOriginal
            ? savedDateFilterPayload(target, counterpart, payload.dataSet)
            : payload;
        if (!value) {
            return undefined;
        }
        // A common date filter created on the target does not take the local identifier of the source.
        const ownValue = payload.restoreTargetOriginal ? value.localIdentifier : undefined;
        return { ...value, localIdentifier: counterpart?.dateFilter.localIdentifier ?? ownValue };
    }),
    defineRule(tabsActions.changeMeasureValueFilterCondition, (payload, target, ctx) => {
        if (payload.isWorkingSelectionChange) {
            return undefined;
        }
        const counterpart = findMeasureValueCounterpart(ctx, target, payload.localIdentifier);
        if (!counterpart) {
            return undefined;
        }
        const localIdentifier = counterpart.dashboardMeasureValueFilter.localIdentifier;
        if (!payload.restoreTargetOriginal) {
            return { ...payload, localIdentifier };
        }
        const original = findOriginalFilter(target, counterpart);
        return isDashboardMeasureValueFilter(original)
            ? { ...payload, localIdentifier, conditions: original.dashboardMeasureValueFilter.conditions }
            : undefined;
    }),
    defineRule(tabsActions.setMeasureValueFilterDimensionality, (payload, target, ctx) => {
        const counterpart = findMeasureValueCounterpart(ctx, target, payload.localIdentifier);
        if (!counterpart) {
            return undefined;
        }
        const localIdentifier = counterpart.dashboardMeasureValueFilter.localIdentifier;
        if (!payload.restoreTargetOriginal) {
            return { ...payload, localIdentifier };
        }
        const original = findOriginalFilter(target, counterpart);
        return isDashboardMeasureValueFilter(original)
            ? {
                  ...payload,
                  localIdentifier,
                  dimensionality: original.dashboardMeasureValueFilter.dimensionality,
              }
            : undefined;
    }),
    defineRule(tabsActions.setParameterRuntimeValues, (payload, target) => {
        const values = payload.values.filter((value) =>
            target.parameters?.parameters.some((entry) => areObjRefsEqual(entry.parameter.ref, value.ref)),
        );
        return values.length > 0 ? { ...payload, values } : undefined;
    }),
    // Other tabs receive the committed values of the source tab, not their own staged values.
    defineRule(tabsActions.applyWorkingSelection, (_payload, target, ctx) => {
        const filters = committedFilterValues(ctx, target);
        const parameters = committedParameterValues(ctx, target);
        if (filters.length === 0 && parameters.length === 0) {
            return undefined;
        }
        return { mirroredSelection: { filters, parameters } };
    }),
];

/**
 * Tabs slice actions that are mirrored to other tabs when filters persist across tabs, keyed by action type.
 * Actions without a rule apply to their own tab only, which includes every filter configuration change.
 *
 * @internal
 */
export const tabSyncRules: ReadonlyMap<string, AnyTabSyncRule> = new Map([
    ...filterContextRules,
    ...selectionRules,
]);
