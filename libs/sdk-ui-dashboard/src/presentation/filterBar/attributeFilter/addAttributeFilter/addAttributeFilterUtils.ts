// (C) 2023 GoodData Corporation

import { VisType } from "@gooddata/sdk-ui";
import { IInsight, insightVisualizationType } from "@gooddata/sdk-model";

const SUPPORTED_LOCATION_ICON_CHART_TYPES: VisType[] = ["pushpin"];

export const isLocationIconEnabled = (insights: IInsight[]) => {
    return insights
        .map((it) => insightVisualizationType(it) as VisType)
        .some((it) => SUPPORTED_LOCATION_ICON_CHART_TYPES.includes(it));
};
