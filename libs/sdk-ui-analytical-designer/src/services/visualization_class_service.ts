// (C) 2007-2026 GoodData Corporation

import { isEmpty } from "lodash-es";
import { createSelector } from "reselect";

import { type IVisualizationClass, visClassUrl } from "@gooddata/sdk-model";

import {
    LOCAL_CHOROPLETH,
    LOCAL_COLUMN,
    LOCAL_HEADLINE,
    LOCAL_MEKKO,
    LOCAL_PUSHPIN,
    LOCAL_RADAR,
    LOCAL_TABLE,
} from "../constants/visualization_types.js";
import { getMapboxToken } from "../selectors/bootstrap_selector.js";
import {
    enableGeoArea,
    enableGeoChartA11yImprovements,
    enableNewGeoPushpin,
    isAccessibilityModeEnabled,
    isEnabledMekkoChart,
    isEnabledRadarChart,
} from "../selectors/feature_flag_selector.js";
import { type IAppState } from "../store/types.js";
import {
    getVisualizationClassState,
    getVisualizationClassesState,
} from "../store/visualization_classes/visualization_classes_selectors.js";
import {
    type IVisualizationClassState,
    type IVisualizationClassesState,
} from "../store/visualization_classes/visualization_classes_state.js";
import { isVisualizationClassSupportedByUrl } from "../utils/visualization_class.js";

export function getVisualizationClassTypeFromState(state: IAppState): string {
    const visualizationClass = getVisualizationClass(state);
    return visualizationClass ? getVisualizationClassType(visualizationClass) : "";
}

function getVisualizationClassUrl(visualizationClass: IVisualizationClass | null | undefined): string {
    if (!visualizationClass || isEmpty(visualizationClass)) {
        return null;
    }

    return visClassUrl(visualizationClass);
}

// TODO: Move it to VisualizationClassUtils
export function getVisualizationClassType(visualizationClass: IVisualizationClass): string {
    // returns type for gooddata visualizations,
    // undefined if visualization type is not `local:*`
    return getVisualizationClassUrl(visualizationClass).split(":")[1];
}

// TODO: Move it to VisualizationClassUtils
export function isVisualizationClassLocal(visualizationClass: IVisualizationClass): boolean {
    // returns whether is local GDC visualization
    return getVisualizationClassUrl(visualizationClass).startsWith("local:");
}

// TODO: Move it to VisualizationClassUtils
export function isVisualizationClassSupported(visualizationClass: IVisualizationClass): boolean {
    return isVisualizationClassSupportedByUrl(getVisualizationClassUrl(visualizationClass));
}

export function getVisualizationClass(state: IAppState): IVisualizationClassState {
    return getVisualizationClassState(state);
}

export function getVisualizationClasses(state: IAppState): IVisualizationClassesState {
    return getVisualizationClassesState(state);
}

const getDisabledVisualizationClassesUrls = createSelector(
    [
        isEnabledRadarChart,
        isEnabledMekkoChart,
        enableNewGeoPushpin,
        enableGeoArea,
        enableGeoChartA11yImprovements,
        isAccessibilityModeEnabled,
        getMapboxToken,
    ],
    (
        isRadarChartEnabled,
        isMekkoChartEnabled,
        isNewGeoPushpinChartEnabled,
        isGeoAreaEnabled,
        isGeoChartA11yImprovementsEnabled,
        isAccessibilityModeEnabled,
        mapboxToken,
    ) => {
        const mapboxTokenDefined = mapboxToken && mapboxToken.length > 0;
        // Accessibility mode offers only geo charts that are actually accessible: the new
        // implementation with its a11y improvements enabled; the legacy mapbox pushpin never is
        return [
            (isAccessibilityModeEnabled
                ? !(isNewGeoPushpinChartEnabled && isGeoChartA11yImprovementsEnabled)
                : !isNewGeoPushpinChartEnabled && !mapboxTokenDefined) && LOCAL_PUSHPIN,
            !isRadarChartEnabled && LOCAL_RADAR,
            !isMekkoChartEnabled && LOCAL_MEKKO,
            (!isGeoAreaEnabled || (isAccessibilityModeEnabled && !isGeoChartA11yImprovementsEnabled)) &&
                LOCAL_CHOROPLETH,
        ].filter(Boolean);
    },
);

export const getEnabledVisualizationClasses = createSelector(
    [getVisualizationClasses, getDisabledVisualizationClassesUrls],
    (visualizationClasses, disabledVisClassUrls): IVisualizationClassesState => {
        return visualizationClasses.filter(
            (visualizationClass) =>
                isVisualizationClassSupported(visualizationClass) &&
                !disabledVisClassUrls.includes(getVisualizationClassUrl(visualizationClass)),
        );
    },
);

export const getEnabledVisualizationClassesUrls = createSelector(
    getEnabledVisualizationClasses,
    (visualizationClasses): string[] => {
        return visualizationClasses.map((visClass) => visClassUrl(visClass));
    },
);

export function isVisualizationClassDeletedOrDeprecated(
    state: IAppState,
    visualizationClassUri: string,
): boolean {
    const foundClass = getVisualizationClasses(state).find(
        (visualizationClass) => visClassUrl(visualizationClass) === visualizationClassUri,
    );

    return !foundClass;
}

// TODO: Move it to VisualizationClassUtils
export function getTableVisualizationClass(visualizationClasses: IVisualizationClassesState) {
    return visualizationClasses.find(
        (visualizationClass) => getVisualizationClassType(visualizationClass) === "table",
    );
}

/**
 * The workspace's `local:<type>` class, or `undefined`. The shortcut and recommendation operation
 * sagas resolve it at their boundary; the guard — skip the type switch when the workspace has no
 * such class — stays at the call sites.
 */
export function getLocalVisualizationClass(state: IAppState, type: string): IVisualizationClass | undefined {
    // through the domain accessor, not the raw path: the subtree is slice-owned and is
    // absent on the pristine state RESET_FOR_PLUGGABLE_MOUNT returns
    return getVisualizationClasses(state).find(
        (visualizationClass) => visClassUrl(visualizationClass) === `local:${type}`,
    );
}

/**
 * Finds visualization class by its content.url.
 */
export function getVisualizationClassByUrl(state: IAppState, visualizationClassUrl: string) {
    return getVisualizationClasses(state).find(
        (visualizationClass) => getVisualizationClassUrl(visualizationClass) === visualizationClassUrl,
    );
}

export function getDefaultVisualizationClass(state: IAppState) {
    const visualizationClasses = getVisualizationClasses(state);
    const tableClass = getTableVisualizationClass(visualizationClasses);

    if (!tableClass) {
        return getEnabledVisualizationClasses(state)[0];
    }

    return tableClass;
}

function isVisualizationWithUrlSelected(state: IAppState, visualizationUrl: string): boolean {
    const visualizationClass = getVisualizationClass(state);
    return visualizationClass ? getVisualizationClassUrl(visualizationClass) === visualizationUrl : false;
}

export function isColumnSelected(state: IAppState): boolean {
    return isVisualizationWithUrlSelected(state, LOCAL_COLUMN);
}

export function isTableSelected(state: IAppState): boolean {
    return isVisualizationWithUrlSelected(state, LOCAL_TABLE);
}

export function isHeadlineSelected(state: IAppState): boolean {
    return isVisualizationWithUrlSelected(state, LOCAL_HEADLINE);
}
