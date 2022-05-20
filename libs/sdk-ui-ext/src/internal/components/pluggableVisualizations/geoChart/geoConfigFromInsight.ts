// (C) 2022 GoodData Corporation
import { IInsightDefinition, insightProperties } from "@gooddata/sdk-model";
import { IGeoConfig } from "@gooddata/sdk-ui-geo";
import filter from "lodash/fp/filter";
import flow from "lodash/fp/flow";
import fromPairs from "lodash/fromPairs";
import isNil from "lodash/isNil";
import toPairs from "lodash/toPairs";
import { IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor";

const supportedGeoConfigProperties = new Set<keyof IGeoConfig>([
    "center",
    "colorMapping",
    "cooperativeGestures",
    "legend",
    "limit",
    "selectedSegmentItems",
    "separators",
    "viewport",
    "points",
    "showLabels",
]);

export function geoConfigFromInsight(insight: IInsightDefinition, ctx?: IEmbeddingCodeContext): IGeoConfig {
    const properties = insightProperties(insight);
    const controls = properties?.controls ?? {};
    const withValuesFromContext = {
        ...controls,
        ...(ctx?.settings?.separators ? { separators: ctx?.settings?.separators } : {}),
    };

    const configFromProperties = flow(
        toPairs,
        filter(([key, value]) => supportedGeoConfigProperties.has(key as any) && !isNil(value)),
        fromPairs,
    )(withValuesFromContext) as IGeoConfig;

    return {
        ...configFromProperties,
        mapboxToken: "<fill your Mapbox token here>",
    };
}
