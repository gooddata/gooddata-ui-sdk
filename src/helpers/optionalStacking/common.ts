// (C) 2007-2019 GoodData Corporation
import isArray = require("lodash/isArray");
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import set = require("lodash/set");
import { AFM, VisualizationObject } from "@gooddata/typings";
import { findBucketByLocalIdentifier, isStackedChart } from "../dimensions";
import { VIEW_BY_ATTRIBUTES_LIMIT } from "../../components/visualizations/chart/constants";
import { MEASURES } from "../../constants/bucketNames";
import { IChartConfig } from "../../interfaces/Config";
import IVisualizationAttribute = VisualizationObject.IVisualizationAttribute;

export function getViewByTwoAttributes(
    viewBy: IVisualizationAttribute | IVisualizationAttribute[],
): IVisualizationAttribute[] {
    if (!viewBy) {
        return [];
    }
    if (viewBy && isArray(viewBy)) {
        // only get first two attributes
        return viewBy.slice(0, VIEW_BY_ATTRIBUTES_LIMIT);
    }
    return [viewBy] as VisualizationObject.IVisualizationAttribute[];
}

export interface ISanitizedBucketsAndStackingConfig {
    buckets: VisualizationObject.IBucket[];
    config: IChartConfig;
}

/**
 * Show a measure as a percentage
 * one measure
 *      => computeRatio = false or not set => evaluate stackMeasuresToPercent
 * multiple measures
 *      => ignore computeRatio and use stackMeasuresToPercent
 *
 * stackMeasures is applied only when there are [2 measures and more]
 * stackMeasuresToPercent is applied only when there are [1 measure + 1 stackBy] or [2 measures and more]
 */
export function getSanitizedBucketsAndStackingConfig(
    buckets: VisualizationObject.IBucket[],
    config: IChartConfig = {},
): ISanitizedBucketsAndStackingConfig {
    const clonedBuckets = cloneDeep(buckets);
    const measuresItems = findBucketByLocalIdentifier(clonedBuckets, MEASURES).items || [];

    if (measuresItems.length > 1) {
        return {
            config,
            buckets: disableComputeRatio(clonedBuckets),
        };
    }

    if (measuresItems.length === 1) {
        const isComputeRatio = getComputeRatio(measuresItems[0]);
        const hasStackByAttribute = isStackedChart(clonedBuckets);
        const { stackMeasures, stackMeasuresToPercent } = config;

        return {
            buckets: clonedBuckets,
            config: {
                ...config,
                stackMeasures: stackMeasures && !isComputeRatio,
                stackMeasuresToPercent: stackMeasuresToPercent && !isComputeRatio && hasStackByAttribute,
            },
        };
    }

    return {
        buckets,
        config,
    };
}

function disableComputeRatio(buckets: VisualizationObject.IBucket[]): VisualizationObject.IBucket[] {
    return buckets.map((bucket: VisualizationObject.IBucket) => {
        if (bucket.localIdentifier === MEASURES) {
            const items: VisualizationObject.BucketItem[] = (bucket.items || []).map(
                disableBucketItemComputeRatio,
            );
            return {
                ...bucket,
                items,
            };
        }

        return bucket;
    });
}

function disableBucketItemComputeRatio(item: VisualizationObject.BucketItem): VisualizationObject.BucketItem {
    if (getComputeRatio(item)) {
        setComputeRatio(item, false);
    }
    return item;
}

export function getComputeRatio(bucketItem: VisualizationObject.BucketItem): boolean {
    return get(bucketItem, ["measure", "definition", "measureDefinition", "computeRatio"], false);
}

function setComputeRatio(bucketItem: VisualizationObject.BucketItem, value: boolean) {
    set(bucketItem, ["measure", "definition", "measureDefinition", "computeRatio"], value);
}

/**
 * Show a measure as a percentage
 * one measure
 *      => computeRatio = false or not set => evaluate stackMeasuresToPercent
 * multiple measures
 *      => ignore computeRatio and use stackMeasuresToPercent
 *
 * stackMeasures is applied only when there are [2 measures and more]
 * stackMeasuresToPercent is applied only when there are [1 measure + 1 stackBy] or [2 measures and up]
 */
export function getSanitizedStackingConfigFromAfm(
    afm: AFM.IAfm,
    chartConfig: IChartConfig,
    hasStackByAttribute: boolean,
): IChartConfig {
    if (get(afm, ["measures", "length"]) === 1) {
        const { stackMeasures, stackMeasuresToPercent } = chartConfig;
        const isComputeRatio = get(afm, ["measures", "0", "definition", "measure", "computeRatio"], false);
        return {
            ...chartConfig,
            stackMeasures: stackMeasures && !isComputeRatio,
            stackMeasuresToPercent: stackMeasuresToPercent && !isComputeRatio && hasStackByAttribute,
        };
    }
    return chartConfig;
}
