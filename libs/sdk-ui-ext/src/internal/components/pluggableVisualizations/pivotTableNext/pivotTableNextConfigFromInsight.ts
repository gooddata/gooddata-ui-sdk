// (C) 2025-2026 GoodData Corporation

import { type IInsightDefinition, insightProperties } from "@gooddata/sdk-model";
import {
    type IColumnSizing,
    type PivotTableNextConfig,
    type PivotTableNextConfigWithConditionalFormatting,
} from "@gooddata/sdk-ui-pivot/next";

import { type IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";
import { type PropMeta, type PropWithMeta } from "../../../utils/embeddingCodeGenerator/types.js";
import {
    getEffectiveConditionalFormatting,
    getPaginationFromProperties,
    getTextWrappingFromProperties,
} from "../../../utils/propertiesHelper.js";
import { removeUseless } from "../../../utils/removeUseless.js";
import { createPivotTableNextConfig } from "../pivotTableNext/PluggablePivotTableNext.js";

const AG_GRID_TOKEN_PLACEHOLDER: PivotTableNextConfig = {
    agGridToken: "<fill your AG Grid Enterprise license token here>",
};

function pivotTableNextConfigMeta(
    name: "PivotTableNextConfig" | "PivotTableNextConfigWithConditionalFormatting",
): PropMeta {
    return {
        typeImport: {
            importType: "named",
            name,
            package: "@gooddata/sdk-ui-pivot/next",
        },
        cardinality: "scalar",
    };
}

/**
 * Only a config that actually carries conditional formatting references the `@alpha` extended
 * type; every other snippet stays on the `@public` {@link PivotTableNextConfig}.
 */
export function pivotTableNextConfigPropMeta(config: unknown): PropMeta {
    const hasConditionalFormatting =
        typeof config === "object" && config !== null && "conditionalFormatting" in config;
    return pivotTableNextConfigMeta(
        hasConditionalFormatting ? "PivotTableNextConfigWithConditionalFormatting" : "PivotTableNextConfig",
    );
}

export function pivotTableNextConfigFromInsight(
    insight: IInsightDefinition,
    ctx: IEmbeddingCodeContext | undefined,
): PivotTableNextConfigWithConditionalFormatting {
    const baseConfig: PivotTableNextConfig =
        ctx?.settings && ctx.backend
            ? createPivotTableNextConfig({ separators: ctx.settings.separators }, "none", ctx.settings)
            : {};
    const properties = insightProperties(insight);
    const controls = properties?.["controls"];

    return removeUseless({
        menu: baseConfig.menu,
        separators: baseConfig.separators,
        measureGroupDimension: controls?.measureGroupDimension,
        columnHeadersPosition: controls?.columnHeadersPosition,
        grandTotalsPosition: controls?.grandTotalsPosition,
        pagination: getPaginationFromProperties(properties),
        textWrapping: getTextWrappingFromProperties(properties),
        conditionalFormatting: getEffectiveConditionalFormatting(insight, ctx?.settings),
        columnSizing: {
            columnWidths: controls?.columnWidths,
            defaultWidth: "autoresizeAll",
            growToFit: true,
        } satisfies IColumnSizing,
        ...AG_GRID_TOKEN_PLACEHOLDER,
    } satisfies PivotTableNextConfigWithConditionalFormatting);
}

export function pivotTableNextConfigForInsightViewComponent(): PropWithMeta<PivotTableNextConfig> {
    return {
        value: AG_GRID_TOKEN_PLACEHOLDER,
        meta: pivotTableNextConfigMeta("PivotTableNextConfig"),
    };
}
