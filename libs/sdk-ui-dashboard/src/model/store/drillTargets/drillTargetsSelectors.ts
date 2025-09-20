// (C) 2021-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { memoize } from "lodash-es";

import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";

import { drillTargetsAdapter } from "./drillTargetsEntityAdapter.js";
import { IDrillTargets } from "./drillTargetsTypes.js";
import { ObjRefMap, newMapForObjectWithIdentity } from "../../../_staging/metadata/objRefMap.js";
import { DashboardSelector, DashboardState } from "../types.js";

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
    memoize((ref: ObjRef) => {
        return createSelector(selectDrillTargets, (drillTargets) => {
            return drillTargets.get(ref);
        });
    }, serializeObjRef);
