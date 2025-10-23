// (C) 2022-2025 GoodData Corporation

import { IInsightDefinition, ISettings } from "@gooddata/sdk-model";
import { DefaultLocale, ILocale, resolveLocale } from "@gooddata/sdk-ui";
import { IChartConfig } from "@gooddata/sdk-ui-charts";
import { IGeoConfig } from "@gooddata/sdk-ui-geo";
import { PivotTableNextConfig } from "@gooddata/sdk-ui-pivot/next";

import { chartConfigFromInsight } from "../../components/pluggableVisualizations/chartCodeGenUtils.js";
import {
    geoConfigForInsightViewComponent,
    isGeoChart,
} from "../../components/pluggableVisualizations/geoChart/geoConfigCodeGenerator.js";
import {
    isPivotTableNext,
    pivotTableNextConfigForInsightViewComponent,
} from "../../components/pluggableVisualizations/pivotTableNext/pivotTableNextConfigFromInsight.js";
import { IEmbeddingCodeContext } from "../../interfaces/VisualizationDescriptor.js";
import { PropWithMeta } from "../embeddingCodeGenerator/index.js";

/**
 * @internal
 */
export function configForInsightView(
    insight: IInsightDefinition,
    settings?: ISettings,
): PropWithMeta<IGeoConfig | IChartConfig | PivotTableNextConfig> | undefined {
    if (isGeoChart(insight) && !settings.enableNewGeoPushpin) {
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

export function localeForInsightView(ctx: IEmbeddingCodeContext): PropWithMeta<ILocale> | undefined {
    const val = resolveLocale(ctx?.settings?.locale);

    return {
        value: val === DefaultLocale ? undefined : val,
        meta: {
            cardinality: "scalar",
        },
    };
}
