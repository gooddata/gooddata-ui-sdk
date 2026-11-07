// (C) 2022-2026 GoodData Corporation

import { type IInsightDefinition, insightProperties } from "@gooddata/sdk-model";
import { type IPivotTableConfig } from "@gooddata/sdk-ui-pivot";
import { _isEmpty } from "@gooddata/util";

import { type IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";
import { getColumnWidthsFromProperties } from "../../../utils/propertiesHelper.js";

import { createPivotTableConfig } from "./PluggablePivotTable.js";

export function pivotTableConfigFromInsight(
    insight: IInsightDefinition,
    ctx: IEmbeddingCodeContext | undefined,
): IPivotTableConfig {
    const baseConfig =
        ctx?.settings && ctx.backend
            ? createPivotTableConfig(
                  { separators: ctx?.settings?.separators },
                  "none",
                  ctx.settings,
                  ctx.backend.capabilities,
                  getColumnWidthsFromProperties(insightProperties(insight)) ?? [],
              )
            : {};

    const columnSizingProp = _isEmpty(baseConfig.columnSizing)
        ? {}
        : { columnSizing: baseConfig.columnSizing };
    const menuProp = _isEmpty(baseConfig.menu) ? {} : { menu: baseConfig.menu };
    const separatorsProp = _isEmpty(baseConfig.separators) ? {} : { separators: baseConfig.separators };
    const measureGroupDimension = insightProperties(insight)?.["controls"]?.measureGroupDimension;
    const metricsPositionProp = _isEmpty(measureGroupDimension) ? {} : { measureGroupDimension };
    const columnHeadersPosition = insightProperties(insight)?.["controls"]?.columnHeadersPosition;
    const columnHeadersPositionProp = _isEmpty(columnHeadersPosition) ? {} : { columnHeadersPosition };

    return {
        ...columnSizingProp,
        ...menuProp,
        ...separatorsProp,
        ...metricsPositionProp,
        ...columnHeadersPositionProp,
        // the user can fill the rest on their own later
    };
}
