// (C) 2022 GoodData Corporation

import { LayoutPath } from "@gooddata/sdk-backend-spi";
import { IDrillToCustomUrl, IDashboardLayout } from "@gooddata/sdk-model";
import update from "lodash/fp/update.js";

import { getDrillToCustomUrlPaths } from "../../toBackend/AnalyticalDashboardConverter.js";
import isEmpty from "lodash/isEmpty.js";
import { joinDrillUrlParts } from "@gooddata/sdk-model/internal";

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
