// (C) 2022 GoodData Corporation
import { IInsightDefinition, insightProperties, insightVisualizationUrl } from "@gooddata/sdk-model";
import { IGeoConfig } from "@gooddata/sdk-ui-geo";
import filter from "lodash/fp/filter";
import flow from "lodash/fp/flow";
import fromPairs from "lodash/fromPairs";
import isNil from "lodash/isNil";
import toPairs from "lodash/toPairs";
import { IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor";
import { PropWithMeta } from "../../../utils/embeddingCodeGenerator";

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
        ...mapBoxTokenPlaceholder(),
    };
}

export function mapBoxTokenPlaceholder(): IGeoConfig {
    return {
        mapboxToken: "<fill your Mapbox token here>",
    };
}

export function isGeoChart(insightDefinition: IInsightDefinition): boolean {
    const type = insightVisualizationUrl(insightDefinition).split(":")[1];

    return type === "pushpin";
}

export function geoConfigForInsightViewComponent(): PropWithMeta<IGeoConfig> | undefined {
    return {
        value: mapBoxTokenPlaceholder(),
        meta: {
            cardinality: "scalar",
            typeImport: {
                importType: "named",
                name: "IGeoConfig",
                package: "@gooddata/sdk-ui-geo",
            },
        },
    };
}
