// (C) 2025 GoodData Corporation

import { isEmpty } from "lodash-es";

import {
    IInsightDefinition,
    ISettings,
    insightProperties,
    insightVisualizationUrl,
} from "@gooddata/sdk-model";
import { IColumnSizing, PivotTableNextConfig } from "@gooddata/sdk-ui-pivot/next";

import { IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";
import { PropWithMeta } from "../../../utils/embeddingCodeGenerator/index.js";
import { getTextWrappingFromProperties } from "../../../utils/propertiesHelper.js";
import { createPivotTableNextConfig } from "../pivotTableNext/PluggablePivotTableNext.js";

const AG_GRID_TOKEN_PLACEHOLDER: PivotTableNextConfig = {
    agGridToken: "<fill your AG Grid Enterprise license token here>",
};

export function isPivotTableNext(insightDefinition: IInsightDefinition, settings: ISettings): boolean {
    const uri = insightVisualizationUrl(insightDefinition);
    return settings?.enableNewPivotTable && uri === "local:table";
}

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
    const measureGroupDimension = insightProperties(insight)?.["controls"]?.measureGroupDimension;
    const metricsPositionProp = isEmpty(measureGroupDimension) ? {} : { measureGroupDimension };
    const columnHeadersPosition = insightProperties(insight)?.["controls"]?.columnHeadersPosition;
    const columnHeadersPositionProp = isEmpty(columnHeadersPosition) ? {} : { columnHeadersPosition };
    const grandTotalsPosition = insightProperties(insight)?.["controls"]?.grandTotalsPosition;
    const grandTotalsPositionProp = isEmpty(grandTotalsPosition) ? {} : { grandTotalsPosition };
    const columnSizing: IColumnSizing = {
        columnWidths: insightProperties(insight)?.["controls"]?.columnWidths,
        defaultWidth: "autoresizeAll",
        growToFit: true,
    };
    const textWrapping = getTextWrappingFromProperties(insightProperties(insight));

    return {
        ...menuProp,
        ...separatorsProp,
        ...metricsPositionProp,
        ...columnHeadersPositionProp,
        ...grandTotalsPositionProp,
        columnSizing,
        textWrapping,
        ...AG_GRID_TOKEN_PLACEHOLDER,
    };
}

export function pivotTableNextConfigForInsightViewComponent(): PropWithMeta<PivotTableNextConfig> {
    return {
        value: AG_GRID_TOKEN_PLACEHOLDER,
        meta: {
            cardinality: "scalar",
            typeImport: {
                importType: "named",
                name: "PivotTableNextConfig",
                package: "@gooddata/sdk-ui-pivot/next",
            },
        },
    };
}
