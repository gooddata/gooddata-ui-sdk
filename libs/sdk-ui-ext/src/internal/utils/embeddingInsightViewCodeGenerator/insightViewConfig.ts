// (C) 2022 GoodData Corporation
import { IInsightDefinition } from "@gooddata/sdk-model";
import { DefaultLocale, ILocale } from "@gooddata/sdk-ui";
import { IGeoConfig } from "@gooddata/sdk-ui-geo";
import {
    geoConfigForInsightViewComponent,
    isGeoChart,
} from "../../components/pluggableVisualizations/geoChart/geoConfigCodeGenerator";
import { IEmbeddingCodeContext } from "../../interfaces/VisualizationDescriptor";
import { PropWithMeta } from "../../utils/embeddingCodeGenerator";

/**
 * @internal
 */
export function configForInsightView(insight: IInsightDefinition): PropWithMeta<IGeoConfig> | undefined {
    if (isGeoChart(insight)) {
        return geoConfigForInsightViewComponent();
    }
}

export function localeForInsightView(ctx: IEmbeddingCodeContext): PropWithMeta<ILocale> | undefined {
    const val = ctx?.settings?.locale as ILocale;

    return {
        value: val && val !== DefaultLocale ? val : undefined,
        meta: {
            cardinality: "scalar",
        },
    };
}
