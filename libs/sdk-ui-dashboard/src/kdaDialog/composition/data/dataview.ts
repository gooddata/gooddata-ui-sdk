// (C) 2025 GoodData Corporation

import { IDataView, IExecutionResult } from "@gooddata/sdk-backend-spi";
import {
    IAttribute,
    IAttributeDescriptor,
    IColorPalette,
    IExecutionDefinition,
    IMeasure,
    IMeasureDescriptor,
    IResultMeasureHeader,
    ISettings,
    ObjRef,
    modifyInlineMeasure,
    newAttribute,
    newInlineMeasure,
    objRefToString,
} from "@gooddata/sdk-model";
import { IChartConfig } from "@gooddata/sdk-ui-charts";

import { DeepReadonly, KdaItem, KdaItemGroup } from "../../internalTypes.js";
import { IKdaDefinition } from "../../types.js";

const DEFAULT_MEASURE_FORMAT = "#,##0.00";
const LIMIT_KDA = 20;

export function createDataView(
    workspace: string,
    def: DeepReadonly<IKdaDefinition> | null,
    group: KdaItemGroup,
    item: KdaItem,
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
            return view!.fingerprint() === v.fingerprint();
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
        withForecast: () => view,
        withClustering: () => view,
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
    group: KdaItemGroup,
    item: KdaItem,
): IChartConfig {
    const { trend, deviation } = getTrendAndDeviation(item);

    const items = getLimitedDataOnly(group, trend);
    const index = items.indexOf(item);
    const min = Math.min(
        items.reduce((c, item) => Math.min(c, item.to.value - item.from.value), Infinity),
        deviation,
    );
    const max = Math.max(
        items.reduce((c, item) => Math.max(c, item.to.value - item.from.value), -Infinity),
        deviation,
    );

    const firstColor = colorPalette[0]?.fill;
    const color = firstColor ? `rgb(${firstColor.r}, ${firstColor.g}, ${firstColor.b})` : "rgb(20, 178, 226)";

    return {
        colorPalette,
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
        chartConfigOverride: getConfigOverride(index, color),
    };
}

function getLimitedDataOnly(group: KdaItemGroup, trend: number) {
    return group.allDrivers.slice(0, LIMIT_KDA).filter((item) => {
        const diff = item.to.value - item.from.value;
        if (trend >= 0) {
            return diff >= 0;
        }
        return diff < 0;
    });
}

function getTrendAndDeviation(item: KdaItem) {
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
