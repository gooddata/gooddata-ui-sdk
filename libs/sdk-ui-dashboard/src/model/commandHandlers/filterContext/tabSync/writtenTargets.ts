// (C) 2026 GoodData Corporation

import { type Action } from "@reduxjs/toolkit";
import { BATCH, type BatchAction } from "redux-batched-actions";

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { type IWrittenTabFilters } from "../../../store/tabs/filterContext/filterContextReducers.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type IWrittenTabParameters } from "../../../store/tabs/parameters/parametersReducers.js";

type MutableWrittenTabFilters = {
    -readonly [K in keyof IWrittenTabFilters]: IWrittenTabFilters[K];
};

/**
 * The applied filters that `actions` write, per tab. Staged selection changes are not applied, so they
 * are skipped.
 *
 * @internal
 */
export function writtenFiltersOf(actions: readonly Action[]): IWrittenTabFilters[] {
    const byTab = new Map<string | undefined, MutableWrittenTabFilters>();
    const forTab = (tabLocalIdentifier: string | undefined): MutableWrittenTabFilters => {
        let written = byTab.get(tabLocalIdentifier);
        if (!written) {
            written = { tabLocalIdentifier, filterLocalIds: [], dateDataSets: [], commonDateFilter: false };
            byTab.set(tabLocalIdentifier, written);
        }
        return written;
    };
    const addFilters = (tabLocalIdentifier: string | undefined, localIdentifiers: string[]): void => {
        const written = forTab(tabLocalIdentifier);
        written.filterLocalIds = [...new Set([...written.filterLocalIds, ...localIdentifiers])];
    };

    for (const action of actions.flatMap(unbatched)) {
        if (
            tabsActions.updateAttributeFilterSelection.match(action) ||
            tabsActions.replaceAttributeFilterItem.match(action) ||
            tabsActions.changeAttributeDisplayForm.match(action)
        ) {
            if (!action.payload.isWorkingSelectionChange) {
                addFilters(action.payload.tabLocalIdentifier, [action.payload.filterLocalId]);
            }
        } else if (tabsActions.clearAttributeFiltersSelection.match(action)) {
            addFilters(action.payload.tabLocalIdentifier, action.payload.filterLocalIds);
        } else if (
            tabsActions.changeMeasureValueFilterCondition.match(action) ||
            tabsActions.setMeasureValueFilterDimensionality.match(action)
        ) {
            if (!("isWorkingSelectionChange" in action.payload && action.payload.isWorkingSelectionChange)) {
                addFilters(action.payload.tabLocalIdentifier, [action.payload.localIdentifier]);
            }
        } else if (tabsActions.upsertDateFilter.match(action) && !action.payload.isWorkingSelectionChange) {
            const written = forTab(action.payload.tabLocalIdentifier);
            const { dataSet } = action.payload;
            if (!dataSet) {
                written.commonDateFilter = true;
            } else if (
                !written.dateDataSets.some((writtenDataSet) => areObjRefsEqual(writtenDataSet, dataSet))
            ) {
                written.dateDataSets = [...written.dateDataSets, dataSet];
            }
        }
    }
    return [...byTab.values()];
}

/**
 * The parameters that `actions` write, per tab.
 *
 * @internal
 */
export function writtenParametersOf(actions: readonly Action[]): IWrittenTabParameters[] {
    const byTab = new Map<string | undefined, ObjRef[]>();
    for (const action of actions.flatMap(unbatched)) {
        if (!tabsActions.setParameterRuntimeValues.match(action)) {
            continue;
        }
        const { tabLocalIdentifier, values } = action.payload;
        const refs = byTab.get(tabLocalIdentifier) ?? [];
        for (const { ref } of values) {
            if (!refs.some((writtenRef) => areObjRefsEqual(writtenRef, ref))) {
                refs.push(ref);
            }
        }
        byTab.set(tabLocalIdentifier, refs);
    }
    return [...byTab.entries()].map(([tabLocalIdentifier, refs]) => ({ tabLocalIdentifier, refs }));
}

function unbatched(action: Action): Action[] {
    return action.type === BATCH ? (action as BatchAction).payload.flatMap(unbatched) : [action];
}
