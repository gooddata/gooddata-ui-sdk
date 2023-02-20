// (C) 2022-2023 GoodData Corporation
import { IInsightDefinition } from "@gooddata/sdk-model";
import { DefaultLocale, ILocale, resolveLocale } from "@gooddata/sdk-ui";
import { IChartConfig } from "@gooddata/sdk-ui-charts";
import { IGeoConfig } from "@gooddata/sdk-ui-geo";
import { chartConfigFromInsight } from "../../components/pluggableVisualizations/chartCodeGenUtils";
import {
    geoConfigForInsightViewComponent,
    isGeoChart,
} from "../../components/pluggableVisualizations/geoChart/geoConfigCodeGenerator";
import { IEmbeddingCodeContext } from "../../interfaces/VisualizationDescriptor";
import { PropWithMeta } from "../embeddingCodeGenerator";

/**
 * @internal
 */
export function configForInsightView(
    insight: IInsightDefinition,
): PropWithMeta<IGeoConfig | IChartConfig> | undefined {
    if (isGeoChart(insight)) {
        return geoConfigForInsightViewComponent();
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
        value: val !== DefaultLocale ? val : undefined,
        meta: {
            cardinality: "scalar",
        },
    };
}
