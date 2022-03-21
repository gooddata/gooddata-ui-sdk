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
    "enableJoinedAttributeAxisName",
    "grid",
    "legend",
    "legendLayout",
    "limits",
    "primaryChartType",
    "secondaryChartType",
    "secondary_xaxis",
    "secondary_yaxis",
    "separators",
    "stackMeasures",
    "stackMeasuresToPercent",
    "xFormat",
    "xLabel",
    "xaxis",
    "yFormat",
    "yLabel",
    "yaxis",
]);

export function chartConfigFromInsight(
    insight: IInsightDefinition,
    ctx?: IEmbeddingCodeContext,
): IChartConfig {
    const properties = insightProperties(insight);
    const controls = properties?.controls ?? {};
    const withValuesFromContext = {
        ...controls,
        ...(ctx?.colorPalette ? { colorPalette: ctx?.colorPalette } : {}),
        ...(ctx?.settings?.separators ? { separators: ctx?.settings?.separators } : {}),
        ...(ctx?.settings?.locale ? { locale: ctx?.settings?.locale } : {}),
    };

    return flow(
        toPairs,
        filter(([key]) => supportedChartConfigProperties.has(key as any)),
        fromPairs,
        (c) => getChartSupportedControls(c, insight, ctx?.settings),
        removeUseless,
    )(withValuesFromContext);
}

export const chartAdditionalFactories: IAdditionalFactoryDefinition[] = [
    {
        importInfo: {
            importType: "named",
            name: "getColorMappingPredicate",
            package: "@gooddata/sdk-ui-vis-commons",
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
