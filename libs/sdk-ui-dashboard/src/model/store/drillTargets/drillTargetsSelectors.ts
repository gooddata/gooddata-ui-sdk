// (C) 2021-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { _memoize } from "@gooddata/util";

import { type ObjRefMap, newMapForObjectWithIdentity } from "../../../_staging/metadata/objRefMap.js";
import { type DashboardSelector, type DashboardState } from "../types.js";

import { drillTargetsAdapter } from "./drillTargetsEntityAdapter.js";
import { type IDrillTargets } from "./drillTargetsTypes.js";

const entitySelectors = drillTargetsAdapter.getSelectors((state: DashboardState) => state.drillTargets);

const selectDrillTargetsInternal = entitySelectors.selectAll;

/**
 * Return all widgets drill targets
 * @alpha
 */
export const selectDrillTargets: DashboardSelector<ObjRefMap<IDrillTargets>> = createSelector(
    selectDrillTargetsInternal,
    (drillTargets) => {
        return newMapForObjectWithIdentity(drillTargets);
    },
);

/**
 * Selects drill targets by widget ref.
 *
 * @alpha
 */
export const selectDrillTargetsByWidgetRef: (ref: ObjRef) => DashboardSelector<IDrillTargets | undefined> =
    _memoize((ref: ObjRef) => {
        return createSelector(selectDrillTargets, (drillTargets) => {
            return drillTargets.get(ref);
        });
    }, serializeObjRef);
