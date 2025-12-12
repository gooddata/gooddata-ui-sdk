// (C) 2022-2025 GoodData Corporation
import { isEmpty } from "lodash-es";

import { type IInsightDefinition, insightProperties } from "@gooddata/sdk-model";
import { type IPivotTableConfig } from "@gooddata/sdk-ui-pivot";

import { createPivotTableConfig } from "./PluggablePivotTable.js";
import { type IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";
import { getColumnWidthsFromProperties } from "../../../utils/propertiesHelper.js";

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

    const columnSizingProp = isEmpty(baseConfig.columnSizing)
        ? {}
        : { columnSizing: baseConfig.columnSizing };
    const menuProp = isEmpty(baseConfig.menu) ? {} : { menu: baseConfig.menu };
    const separatorsProp = isEmpty(baseConfig.separators) ? {} : { separators: baseConfig.separators };
    const measureGroupDimension = insightProperties(insight)?.["controls"]?.measureGroupDimension;
    const metricsPositionProp = isEmpty(measureGroupDimension) ? {} : { measureGroupDimension };
    const columnHeadersPosition = insightProperties(insight)?.["controls"]?.columnHeadersPosition;
    const columnHeadersPositionProp = isEmpty(columnHeadersPosition) ? {} : { columnHeadersPosition };

    return {
        ...columnSizingProp,
        ...menuProp,
        ...separatorsProp,
        ...metricsPositionProp,
        ...columnHeadersPositionProp,
        // the user can fill the rest on their own later
    };
}
