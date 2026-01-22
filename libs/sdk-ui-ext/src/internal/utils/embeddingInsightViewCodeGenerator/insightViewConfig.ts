// (C) 2022-2026 GoodData Corporation

import { type IInsightDefinition, type ISettings } from "@gooddata/sdk-model";
import { DefaultLocale, type ILocale, resolveLocale } from "@gooddata/sdk-ui";
import { type IChartConfig } from "@gooddata/sdk-ui-charts";
import { type IGeoConfig } from "@gooddata/sdk-ui-geo";
import { type PivotTableNextConfig } from "@gooddata/sdk-ui-pivot/next";

import { chartConfigFromInsight } from "../../components/pluggableVisualizations/chartCodeGenUtils.js";
import {
    geoConfigForInsightViewComponent,
    isGeoChart,
} from "../../components/pluggableVisualizations/geoChart/geoConfigCodeGenerator.js";
import {
    isPivotTableNext,
    pivotTableNextConfigForInsightViewComponent,
} from "../../components/pluggableVisualizations/pivotTableNext/pivotTableNextConfigFromInsight.js";
import { type IEmbeddingCodeContext } from "../../interfaces/VisualizationDescriptor.js";
import { type PropWithMeta } from "../embeddingCodeGenerator/types.js";

/**
 * @internal
 */
export function configForInsightView(
    insight: IInsightDefinition,
    settings?: ISettings,
): PropWithMeta<IGeoConfig | IChartConfig | PivotTableNextConfig> | undefined {
    if (isGeoChart(insight) && !settings?.enableNewGeoPushpin) {
        return geoConfigForInsightViewComponent();
    }
    if (isPivotTableNext(insight, settings)) {
        return pivotTableNextConfigForInsightViewComponent();
    }
    return {
        value: chartConfigFromInsight(insight),
        meta: {
            typeImport: {
                importType: "named",
                name: "IChartConfig",
                package: "@gooddata/sdk-ui-charts",
            },
            cardinality: "scalar",
        },
    };
}

export function localeForInsightView(
    ctx: IEmbeddingCodeContext,
): PropWithMeta<ILocale | undefined> | undefined {
    const val = resolveLocale(ctx?.settings?.locale);

    return {
        value: val === DefaultLocale ? undefined : val,
        meta: {
            cardinality: "scalar",
        },
    };
}
