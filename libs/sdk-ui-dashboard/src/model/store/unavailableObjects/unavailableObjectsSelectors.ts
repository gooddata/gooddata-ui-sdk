// (C) 2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import type { IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import type { ObjRef, ObjectType } from "@gooddata/sdk-model";

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

/**
 * Selects the insights the current user is not allowed to see, in a mapping of obj ref to the
 * unavailability entry. Insights that are merely deleted are not included — those keep rendering the
 * missing-visualization tile instead of the restricted placeholder.
 *
 * @alpha
 */
export const selectRestrictedInsightsMap: DashboardSelector<ObjRefMap<IUnavailableDashboardReference>> =
    createSelector(selectUnavailableObjects, (objects) =>
        newMapForObjectWithRef(
            objects.filter((object) => object.type === "insight" && object.reason === "forbidden"),
            "insight",
        ),
    );

/**
 * Object types a rich text widget can reference: `{metric/id}` and `{label/id}`.
 */
const RICH_TEXT_REFERENCE_TYPES: ObjectType[] = ["measure", "displayForm"];

/**
 * Selects the refs a rich text widget references but the current user is not allowed to read. A
 * reference that is merely deleted is not included — that keeps rendering today's error value,
 * while these are replaced by the restricted marker and left out of the widget's execution.
 *
 * @alpha
 */
export const selectRestrictedRichTextReferences: DashboardSelector<ObjRef[]> = createSelector(
    selectUnavailableObjects,
    (objects) =>
        objects
            .filter(
                (object) => object.reason === "forbidden" && RICH_TEXT_REFERENCE_TYPES.includes(object.type),
            )
            .map((object) => object.ref),
);
