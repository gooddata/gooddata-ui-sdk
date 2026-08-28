// (C) 2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import type { IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import type { ObjectType } from "@gooddata/sdk-model";

import { type ObjRefMap, newMapForObjectWithRef } from "../../../_staging/metadata/objRefMap.js";
import { createMemoizedSelector } from "../_infra/selectors.js";
import { type DashboardSelector, type DashboardState } from "../types.js";

import { unavailableObjectsEntityAdapter } from "./unavailableObjectsEntityAdapter.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.unavailableObjects,
);

const adapterSelectors = unavailableObjectsEntityAdapter.getSelectors(selectSelf);

/**
 * Selects all references of the current dashboard that are unavailable to the current user.
 *
 * @alpha
 */
export const selectUnavailableObjects: DashboardSelector<IUnavailableDashboardReference[]> =
    adapterSelectors.selectAll;

/**
 * Selects the unavailable dashboard references of the given object type in a mapping of obj ref to the
 * unavailability entry. Objects of different types may share an identifier, hence the per-type maps.
 *
 * @alpha
 */
export const selectUnavailableObjectsMapByType: (
    type: ObjectType,
) => DashboardSelector<ObjRefMap<IUnavailableDashboardReference>> = createMemoizedSelector(
    (type: ObjectType) =>
        createSelector(selectUnavailableObjects, (objects) =>
            newMapForObjectWithRef(
                objects.filter((object) => object.type === type),
                type,
            ),
        ),
);
