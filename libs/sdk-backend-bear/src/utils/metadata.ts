// (C) 2021 GoodData Corporation
import compact from "lodash/compact";
import uniq from "lodash/uniq";
import { GdcDashboard, GdcVisualizationObject } from "@gooddata/api-model-bear";

/**
 * @internal
 * TODO consider making this a generic method in api-model-bear that can handle any metadata object and wrapped metadata object
 */
export function getVisualizationUserUris(visualization: GdcVisualizationObject.IVisualization): string[] {
    return uniq(
        compact([
            visualization.visualizationObject.meta.author,
            visualization.visualizationObject.meta.contributor,
        ]),
    );
}

/**
 * @internal
 * TODO consider making this a generic method in api-model-bear that can handle any metadata object and wrapped metadata object
 */
export function getAnalyticalDashboardUserUris(
    dashboard: GdcDashboard.IWrappedAnalyticalDashboard,
): string[] {
    return uniq(
        compact([dashboard.analyticalDashboard.meta.author, dashboard.analyticalDashboard.meta.contributor]),
    );
}
