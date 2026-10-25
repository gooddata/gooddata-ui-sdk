// (C) 2026 GoodData Corporation

import { type ISortItem } from "@gooddata/sdk-model";

import { type IVisualizationPropertiesControls } from "../../typings/properties.js";
import { type IAppState } from "../types.js";

import { type IPropertiesMetaState } from "./properties_meta_state.js";
import { type IPropertiesState } from "./properties_state.js";

/**
 * The domain's input selectors. The derived readers stay in
 * selectors/visualization_properties_selector.ts and hang off these.
 *
 * The fallbacks matter: neither subtree is seeded outside its slice, so a raw read of the pristine
 * post-reset state would see `undefined`.
 */
export const getVisualizationProperties = (state: IAppState) => state.data.visualizationProperties;

/**
 * Deliberately NOT defaulted: a properties replace can drop the key entirely, and the readers write
 * whatever they read into the reference point — including `undefined`.
 */
export const getVisualizationPropertiesSortItems = (state: IAppState): ISortItem[] | undefined =>
    (getVisualizationProperties(state) as IPropertiesState).sortItems;

/** The `controls` bag of the merged properties. */
export const getVisualizationPropertiesControls = (
    state: IAppState,
): IVisualizationPropertiesControls | undefined =>
    (getVisualizationProperties(state) as IPropertiesState).controls;

/**
 * The `controls` leaves the app reads by name. `notSetValue` is the caller's, not ours: the
 * stacking flags fall back to a uiConfig-provided default (see selectors/optional_stacking_selector.ts),
 * which only the caller knows. Key-presence semantics apply: a stored `undefined` wins over the
 * default.
 */
export const getVisualizationPropertiesControl = <T>(
    state: IAppState,
    control: string,
    notSetValue?: T,
): T => {
    const controls = getVisualizationPropertiesControls(state);
    // own-property check: `in` would also match inherited names (`toString`), which the
    // deliberately not a nullish check
    return controls && Object.prototype.hasOwnProperty.call(controls, control)
        ? (controls[control] as T)
        : (notSetValue as T);
};

export const getPropertiesMetaState: (state: IAppState) => IPropertiesMetaState = (state: IAppState) =>
    state.data.propertiesMeta;

/**
 * The `propertiesMeta` flags AD reads by name. They are all "absent means false" (a visualization
 * that never pushed the flag back).
 */
export const isStackToPercentDisabledByNegativeValues = (state: IAppState): boolean =>
    getPropertiesMetaState(state).stackToPercentDisabledByNegativeValues ?? false;

export const isGeoSegmentConflictRecommended = (state: IAppState): boolean =>
    getPropertiesMetaState(state).isGeoSegmentConflictRecommended ?? false;

export const isFilteringRecommended = (state: IAppState): boolean =>
    getPropertiesMetaState(state).isFilteringRecommended ?? false;
