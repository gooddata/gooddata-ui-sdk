// (C) 2007-2026 GoodData Corporation

import { type ICustomRouteParams } from "../typings/location.js";

export const DEFAULT_REPORT_ID = "reportId";

/**
 * The url parameter value. In the embedded url, the parameter ?hideControl=[topBar] means hide the
 * editor header menu.
 */
export const TOP_BAR = "topBar";

export const defaultRouteParams: ICustomRouteParams = {
    projectId: null,
    reportId: DEFAULT_REPORT_ID,
    dataset: null,
    includeObjectsWithTags: null,
    excludeObjectsWithTags: null,
};
