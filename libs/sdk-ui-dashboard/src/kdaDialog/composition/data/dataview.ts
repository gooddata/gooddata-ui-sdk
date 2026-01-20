// (C) 2025-2026 GoodData Corporation

import { type IDataView, type IExecutionResult } from "@gooddata/sdk-backend-spi";
import {
    type IAttribute,
    type IAttributeDescriptor,
    type IColorPalette,
    type IExecutionDefinition,
    type IMeasure,
    type IMeasureDescriptor,
    type IResultMeasureHeader,
    type ISettings,
    type ObjRef,
    modifyInlineMeasure,
    newAttribute,
    newInlineMeasure,
    objRefToString,
} from "@gooddata/sdk-model";
import { type IChartConfig } from "@gooddata/sdk-ui-charts";

import { type IKdaItem, type IKdaItemGroup } from "../../internalTypes.js";
import { type DeepReadonly, type IKdaDefinition } from "../../types.js";

const YAXIS_ADDITION_PERCENTAGE = 1.1; //+10%
const DEFAULT_MEASURE_FORMAT = "#,##0.00";
const LIMIT_KDA = 20;

export function createDataView(
    workspace: string,
    def: DeepReadonly<IKdaDefinition> | null,
    group: IKdaItemGroup,
    item: IKdaItem,
    title: string,
): IDataView | null {
    if (!def) {
        return null;
    }

    const { trend, deviation } = getTrendAndDeviation(item);

    const [tempMeasure, tempMeasureHeader, tempMeasureDescriptor] = createTempMeasure(def.metric);
    const [stdMeasure, stdMeasureHeader, stdMeasureDescriptor] = createStandardDeviationMeasure(
        def.metric,
        title,
        deviation,
    );
    const [attribute, attributeDescriptor] = createDateAttribute(item.displayForm, item.title);

    const items = getLimitedDataOnly(group, trend);
    const attributeData = items.map((item) => item.to.value - item.from.value);
    const stdDate = attributeData.map(() => deviation);

    const definition: IExecutionDefinition = {
        workspace,
        buckets: [
            {
                items: [tempMeasure],
                localIdentifier: "measures",
            },
            {
                items: [stdMeasure],
                localIdentifier: "secondary_measures",
            },
            {
                items: [attribute],
                localIdentifier: "view",
            },
        ],
        attributes: [attribute],
        measures: [tempMeasure, stdMeasure],
        filters: [],
        sortBy: [
            {
                attributeSortItem: {
                    attributeIdentifier: attribute.attribute.localIdentifier,
                    direction: "asc",
                },
            },
        ],
        dimensions: [
            {
                itemIdentifiers: ["measureGroup"],
            },
            {
                itemIdentifiers: [attribute.attribute.localIdentifier],
            },
        ],
    };

    const view: IDataView = {
        offset: [0, 0],
        count: [2, attributeData.length],
        totalCount: [2, attributeData.length],
        headerItems: [
            [[tempMeasureHeader, stdMeasureHeader]],
            [
                items.map((item) => ({
                    attributeHeaderItem: {
                        uri: item.category,
                        name: item.category,
                    },
                })),
            ],
        ],
        data: [attributeData, stdDate],
        definition,
        result: {} as IExecutionResult,
        metadata: {
            dataSourceMessages: [],
        },
        equals: (v: IDataView) => {
            return view.fingerprint() === v.fingerprint();
        },
        fingerprint: () => {
            return JSON.stringify(definition);
        },
        forecast: () => ({
            headerItems: [],
            prediction: [],
            low: [],
            high: [],
            loading: false,
        }),
        clustering: () => ({
            attribute: [],
            clusters: [],
            xcoord: [],
            ycoord: [],
        }),
        outliers: () => ({
            headerItems: [],
            anomalies: [],
            loading: false,
        }),
        withOutliers: () => view,
        withForecast: () => view,
        withClustering: () => view,
        readCollectionItems: () =>
            Promise.resolve({
                type: "FeatureCollection",
                features: [],
                bbox: undefined,
            }),
    };

    return {
        ...view,
        result: createExecutionResults(
            view,
            [tempMeasureDescriptor, stdMeasureDescriptor],
            attributeDescriptor,
        ),
    };
}

function createExecutionResults(
    view: IDataView,
    measures: IMeasureDescriptor[],
    attributeDescriptor: IAttributeDescriptor,
): IExecutionResult {
    const res: IExecutionResult = {
        definition: view.definition,
        dimensions: [
            {
                headers: [
                    {
                        measureGroupHeader: {
                            items: measures,
                        },
                    },
                ],
            },
            {
                headers: [attributeDescriptor],
            },
        ],
        withSignal: () => res,
        readAll: () => Promise.resolve(view),
        readWindow: () => Promise.resolve(view),
        readForecastAll: () =>
            Promise.resolve({
                attribute: [],
                origin: [],
                prediction: [],
                lowerBound: [],
                upperBound: [],
            }),
        readOutliersAll: () =>
            Promise.resolve({
                attributes: [],
                metrics: [],
            }),
        readAnomalyDetectionAll: () =>
            Promise.resolve({
                attribute: [],
                values: [],
                anomalyFlag: [],
            }),
        readClusteringAll: () =>
            Promise.resolve({
                attribute: [],
                clusters: [],
                xcoord: [],
                ycoord: [],
            }),
        transform: () => {
            throw new Error("This method is not implemented.");
        },
        export: () =>
            Promise.resolve({
                uri: "",
                objectUrl: "",
            }),
        equals: (r: IExecutionResult) => {
            return r.fingerprint() === res.fingerprint();
        },
        fingerprint: () => {
            return JSON.stringify(view.definition);
        },
    };

    return res;
}

function createTempMeasure(
    metric: DeepReadonly<IMeasure>,
): [IMeasure, IResultMeasureHeader, IMeasureDescriptor] {
    const maql = `SELECT 0`;
    const localId = `${metric.measure.localIdentifier}_vak`;
    const title = metric.measure.alias ?? metric.measure.title ?? "";
    return [
        modifyInlineMeasure(newInlineMeasure(maql), (m) => {
            return m.title(title).localId(localId).format(metric.measure.format);
        }),
        {
            measureHeaderItem: {
                name: title,
                order: 0,
            },
        },
        {
            measureHeaderItem: {
                localIdentifier: localId,
                name: title,
                format: metric.measure.format ?? DEFAULT_MEASURE_FORMAT,
            },
        },
    ];
}

function createStandardDeviationMeasure(
    metric: DeepReadonly<IMeasure>,
    title: string,
    deviation: number,
): [IMeasure, IResultMeasureHeader, IMeasureDescriptor] {
    const maql = `SELECT ${deviation}`;
    const localId = `${metric.measure.localIdentifier}_std`;
    return [
        modifyInlineMeasure(newInlineMeasure(maql), (m) => {
            return m.title(title).localId(localId).format(metric.measure.format);
        }),
        {
            measureHeaderItem: {
                name: title,
                order: 1,
            },
        },
        {
            measureHeaderItem: {
                localIdentifier: localId,
                name: title,
                format: metric.measure.format ?? DEFAULT_MEASURE_FORMAT,
            },
        },
    ];
}

function createDateAttribute(ref: ObjRef, alias: string): [IAttribute, IAttributeDescriptor] {
    const localId = `${objRefToString(ref)}_attribute`;
    return [
        newAttribute(ref, (m) => m.localId(localId).alias(alias)),
        {
            attributeHeader: {
                identifier: objRefToString(ref),
                uri: "",
                ref,
                formOf: {
                    name: alias,
                    identifier: objRefToString(ref),
                    uri: "",
                    ref,
                },
                primaryLabel: ref,
                localIdentifier: localId,
                name: alias,
                totalItems: [],
            },
        },
    ];
}

export function createConfig(
    settings: ISettings,
    colorPalette: IColorPalette,
    group: IKdaItemGroup,
    item: IKdaItem,
): IChartConfig {
    const { trend, deviation } = getTrendAndDeviation(item);

    const items = getLimitedDataOnly(group, trend);
    const index = items.indexOf(item);
    const min =
        Math.min(
            items.reduce((c, item) => Math.min(c, item.to.value - item.from.value), Infinity),
            deviation,
        ) * YAXIS_ADDITION_PERCENTAGE;
    const max =
        Math.max(
            items.reduce((c, item) => Math.max(c, item.to.value - item.from.value), -Infinity),
            deviation,
        ) * YAXIS_ADDITION_PERCENTAGE;

    const d = 0.2;
    const firstColor = colorPalette[0]?.fill ?? { r: 20, g: 178, b: 226 };
    const mainColor = `rgb(${firstColor.r}, ${firstColor.g}, ${firstColor.b})`;
    const darkerColor = `rgb(${darker(firstColor.r, d)}, ${darker(firstColor.g, d)}, ${darker(firstColor.b, d)})`;

    return {
        colors: [mainColor, darkerColor],
        chartFill: {
            type: "outline",
        },
        tooltip: {
            enabled: true,
            className: "gd-kda__vis_tooltip",
        },
        legend: {
            enabled: false,
            responsive: "autoPositionWithPopup" as const,
        },
        dataPoints: {
            visible: false,
        },
        yaxis: {
            min: min?.toString(),
            max: max?.toString(),
        },
        secondary_yaxis: {
            labelsEnabled: false,
            name: {
                visible: false,
            },
            min: min?.toString(),
            max: max?.toString(),
        },
        enableAccessibleTooltip: settings.enableAccessibleChartTooltip,
        enableVisualizationFineTuning: true,
        chartConfigOverride: getConfigOverride(index, mainColor),
    };
}

function getLimitedDataOnly(group: IKdaItemGroup, trend: number) {
    return group.allDrivers.slice(0, LIMIT_KDA).filter((item) => {
        const diff = item.to.value - item.from.value;
        if (trend >= 0) {
            return diff >= 0;
        }
        return diff < 0;
    });
}

function getTrendAndDeviation(item: IKdaItem) {
    const trend = item.to.value - item.from.value;
    const deviation = trend >= 0 ? item.mean + item.standardDeviation : item.mean - item.standardDeviation;

    return {
        trend,
        deviation,
    };
}

function getConfigOverride(index: number, color: string) {
    return `
series:
  '0':
    data:
      '${index}':
        color: ${color}`;
}

function darker(color: number, percent: number) {
    const p = Math.abs(percent);
    const constant = 1 - p;

    if (constant === 0) {
        return color;
    }
    const c = Math.round((color - 255 * p) / constant);
    return Math.max(0, Math.min(255, c));
}
