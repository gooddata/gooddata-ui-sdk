// (C) 2025 GoodData Corporation

import { IInsightDefinition, insightProperties } from "@gooddata/sdk-model";
import { PivotTableNextConfig } from "@gooddata/sdk-ui-pivot/next";
import isEmpty from "lodash/isEmpty.js";

export function pivotTableNextConfigFromInsight(insight: IInsightDefinition): PivotTableNextConfig {
    const measureGroupDimension = insightProperties(insight)?.controls?.measureGroupDimension;
    const metricsPositionProp = !isEmpty(measureGroupDimension) ? { measureGroupDimension } : {};
    const columnHeadersPosition = insightProperties(insight)?.controls?.columnHeadersPosition;
    const columnHeadersPositionProp = !isEmpty(columnHeadersPosition) ? { columnHeadersPosition } : {};

    return {
        ...metricsPositionProp,
        ...columnHeadersPositionProp,
    };
}
