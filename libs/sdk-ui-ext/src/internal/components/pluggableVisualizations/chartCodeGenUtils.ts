// (C) 2022 GoodData Corporation
import {
    factoryNotationFor,
    isColorMappingItem,
    IInsightDefinition,
    insightProperties,
} from "@gooddata/sdk-model";
import { IChartConfig } from "@gooddata/sdk-ui-charts";
import filter from "lodash/fp/filter";
import flow from "lodash/fp/flow";
import fromPairs from "lodash/fromPairs";
import toPairs from "lodash/toPairs";

import { IEmbeddingCodeContext } from "../../interfaces/VisualizationDescriptor";
import {
    IAdditionalFactoryDefinition,
    IInsightToPropConversion,
    insightConversion,
    PropMeta,
} from "../../utils/embeddingCodeGenerator";
import { getChartSupportedControls } from "../../utils/propertiesHelper";
import { removeUseless } from "../../utils/removeUseless";

const supportedChartConfigProperties = new Set<keyof IChartConfig>([
    "colorMapping",
    "colorPalette",
    "dataLabels",
    "dataPoints",
    "dualAxis",
    "enableChartSorting",
    "enableSeparateTotalLabels",
    "enableJoinedAttributeAxisName",
    "grid",
    "legend",
    "legendLayout",
    "limits",
    "primaryChartType",
    "secondary_xaxis",
    "secondary_yaxis",
    "secondaryChartType",
    "separators",
    "stackMeasures",
    "stackMeasuresToPercent",
    "xaxis",
    "xFormat",
    "xLabel",
    "yaxis",
    "yFormat",
    "yLabel",
]);

export function chartConfigFromInsight(
    insight: IInsightDefinition,
    ctx?: IEmbeddingCodeContext,
): IChartConfig {
    const properties = insightProperties(insight);
    const controls = properties?.controls ?? {};
    const includeColorPalette = ctx?.backend?.capabilities.supportsCustomColorPalettes ?? false;
    const withValuesFromContext = {
        ...controls,
        ...(ctx?.colorPalette && includeColorPalette ? { colorPalette: ctx.colorPalette } : {}),
        ...(ctx?.settings?.separators ? { separators: ctx.settings.separators } : {}),
        ...(ctx?.settings?.enableChartsSorting ? { enableChartSorting: true } : {}),
        ...(ctx?.settings?.enableSeparateTotalLabels ? { enableSeparateTotalLabels: true } : {}),
        ...(ctx?.settings?.enableAxisNameViewByTwoAttributes ? { enableJoinedAttributeAxisName: true } : {}),
    };

    return flow(
        toPairs,
        filter(([key]) => supportedChartConfigProperties.has(key as any)),
        fromPairs,
        (c) => getChartSupportedControls(c, insight, ctx?.settings),
        removeUseless,
    )(withValuesFromContext);
}

export function chartAdditionalFactories(options?: {
    getColorMappingPredicatePackage?: string;
}): IAdditionalFactoryDefinition[] {
    const { getColorMappingPredicatePackage = "@gooddata/sdk-ui-charts" } = options ?? {};

    return [
        {
            importInfo: {
                importType: "named",
                name: "getColorMappingPredicate",
                package: getColorMappingPredicatePackage,
            },
            transformation: (obj) => {
                return isColorMappingItem(obj)
                    ? `{predicate: getColorMappingPredicate("${obj.id}"), color: ${factoryNotationFor(
                          obj.color,
                      )}}`
                    : undefined;
            },
        },
    ];
}

const chartConfigPropMeta: PropMeta = {
    typeImport: {
        importType: "named",
        name: "IChartConfig",
        package: "@gooddata/sdk-ui-charts",
    },
    cardinality: "scalar",
};

export function chartConfigInsightConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
): IInsightToPropConversion<TProps, TPropKey, IChartConfig> {
    return insightConversion(propName, chartConfigPropMeta, chartConfigFromInsight);
}
