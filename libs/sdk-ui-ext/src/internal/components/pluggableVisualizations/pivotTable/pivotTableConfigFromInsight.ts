// (C) 2022 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { IInsightDefinition, insightProperties } from "@gooddata/sdk-model";
import { IPivotTableConfig } from "@gooddata/sdk-ui-pivot";
import { IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";
import { createPivotTableConfig } from "./PluggablePivotTable.js";
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

    const columnSizingProp = !isEmpty(baseConfig.columnSizing)
        ? { columnSizing: baseConfig.columnSizing }
        : {};
    const menuProp = !isEmpty(baseConfig.menu) ? { menu: baseConfig.menu } : {};
    const separatorsProp = !isEmpty(baseConfig.separators) ? { separators: baseConfig.separators } : {};

    return {
        ...columnSizingProp,
        ...menuProp,
        ...separatorsProp,
        // the user can fill the rest on their own later
    };
}
