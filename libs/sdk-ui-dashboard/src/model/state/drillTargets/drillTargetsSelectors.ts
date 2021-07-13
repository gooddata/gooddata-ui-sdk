// (C) 2021 GoodData Corporation

import { DashboardState } from "../types";
import { drillTargetsAdapter } from "./drillTargetsEntityAdapter";
import memoize from "lodash/memoize";
import { createSelector } from "@reduxjs/toolkit";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { newMapForObjectWithRef } from "../../../_staging/metadata/objRefMap";

const entitySelectors = drillTargetsAdapter.getSelectors((state: DashboardState) => state.drillTargets);

const selectDrillTargetsInternal = entitySelectors.selectAll;

/**
 * Return all widgets drill targets
 * @internal
 */
export const selectDrillTargets = createSelector(selectDrillTargetsInternal, (drillTargets) => {
    return newMapForObjectWithRef(drillTargets);
});

/**
 * Selects drill targets by widget ref.
 *
 * @internal
 */
export const selectDrillTargetsByWidgetRef = memoize((ref: ObjRef) => {
    return createSelector(selectDrillTargets, (drillTargets) => {
        return drillTargets.get(ref);
    });
}, serializeObjRef);
