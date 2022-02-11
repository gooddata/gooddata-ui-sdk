// (C) 2022 GoodData Corporation

import { IDashboardLayout, IDrillToCustomUrl, LayoutPath } from "@gooddata/sdk-backend-spi";
import update from "lodash/fp/update";

import { getDrillToCustomUrlPaths } from "../../toBackend/AnalyticalDashboardConverter";
import isEmpty from "lodash/isEmpty";
import { joinDrillUrlParts } from "@gooddata/sdk-backend-spi/dist/workspace/dashboards/drillUrls";

function convertTargetUrlPartsToString(drill: IDrillToCustomUrl) {
    return update(["target", "url"], joinDrillUrlParts, drill);
}

export function convertDrillToCustomUrlInLayoutFromBackend(layout?: IDashboardLayout) {
    if (!layout) {
        return;
    }

    const paths = getDrillToCustomUrlPaths(layout);
    if (isEmpty(paths)) {
        return layout;
    }

    return paths.reduce((layout: IDashboardLayout, path: LayoutPath) => {
        return update(path, convertTargetUrlPartsToString, layout);
    }, layout);
}
