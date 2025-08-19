// (C) 2023-2025 GoodData Corporation

import { IInsight, IInsightWidget, insightVisualizationType } from "@gooddata/sdk-model";
import { VisType } from "@gooddata/sdk-ui";

import { ObjRefMap } from "../../../../_staging/metadata/objRefMap.js";
import { ExtendedDashboardWidget } from "../../../../model/index.js";

const SUPPORTED_LOCATION_ICON_CHART_TYPES: VisType[] = ["pushpin"];

export const isLocationIconEnabled = (
    insightWidgets: ExtendedDashboardWidget[],
    insightsMap: ObjRefMap<IInsight>,
) => {
    return insightWidgets
        .map((it) => insightsMap.get((it as IInsightWidget)?.insight))
        .map((it) => (it && insightVisualizationType(it)) as VisType)
        .some((it) => SUPPORTED_LOCATION_ICON_CHART_TYPES.includes(it));
};
