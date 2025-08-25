// (C) 2025 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";

import { IInsightDefinition, insightProperties } from "@gooddata/sdk-model";
import { IColumnSizing, PivotTableNextConfig } from "@gooddata/sdk-ui-pivot/next";

import { IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";
import { getTextWrappingFromProperties } from "../../../utils/propertiesHelper.js";
import { createPivotTableNextConfig } from "../pivotTableNext/PluggablePivotTableNext.js";

export function pivotTableNextConfigFromInsight(
    insight: IInsightDefinition,
    ctx: IEmbeddingCodeContext | undefined,
): PivotTableNextConfig {
    const baseConfig =
        ctx?.settings && ctx.backend
            ? createPivotTableNextConfig({ separators: ctx?.settings?.separators }, "none", ctx.settings)
            : {};
    const menuProp = isEmpty(baseConfig.menu) ? {} : { menu: baseConfig.menu };
    const separatorsProp = isEmpty(baseConfig.separators) ? {} : { separators: baseConfig.separators };
    const measureGroupDimension = insightProperties(insight)?.controls?.measureGroupDimension;
    const metricsPositionProp = isEmpty(measureGroupDimension) ? {} : { measureGroupDimension };
    const columnHeadersPosition = insightProperties(insight)?.controls?.columnHeadersPosition;
    const columnHeadersPositionProp = isEmpty(columnHeadersPosition) ? {} : { columnHeadersPosition };
    const columnSizing: IColumnSizing = {
        columnWidths: insightProperties(insight)?.controls?.columnWidths,
        defaultWidth: "autoresizeAll",
        growToFit: true,
    };
    const textWrapping = getTextWrappingFromProperties(insightProperties(insight));

    return {
        ...menuProp,
        ...separatorsProp,
        ...metricsPositionProp,
        ...columnHeadersPositionProp,
        columnSizing,
        textWrapping,
    };
}
