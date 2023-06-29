// (C) 2021-2023 GoodData Corporation

import { DashboardSelector, DashboardState } from "../types.js";
import { drillTargetsAdapter } from "./drillTargetsEntityAdapter.js";
import memoize from "lodash/memoize.js";
import { createSelector } from "@reduxjs/toolkit";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { ObjRefMap, newMapForObjectWithIdentity } from "../../../_staging/metadata/objRefMap.js";
import { IDrillTargets } from "./drillTargetsTypes.js";

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
