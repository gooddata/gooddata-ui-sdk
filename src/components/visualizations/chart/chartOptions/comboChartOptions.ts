// (C) 2007-2019 GoodData Corporation
import set = require('lodash/set');
import get = require('lodash/get');
import cloneDeep = require('lodash/cloneDeep');
import { Execution, VisualizationObject as VizObject } from '@gooddata/typings';
import { MEASURES, SECONDARY_MEASURES } from '../../../../constants/bucketNames';
import { IChartConfig, ISeriesItem } from '../../../../interfaces/Config';
import { VisualizationTypes } from '../../../../constants/visualizationTypes';

export const CHART_ORDER = {
    [VisualizationTypes.AREA]: 1,
    [VisualizationTypes.COLUMN]: 2,
    [VisualizationTypes.LINE]: 3
};

const DEFAULT_COMBO_CHART_TYPES = [
    VisualizationTypes.COLUMN,
    VisualizationTypes.LINE
];

function getMeasureIndices(
    bucketItems: VizObject.BucketItem[],
    measureGroupIdentifiers: string[]
): number[] {
    return bucketItems.reduce((result: number[], item: VizObject.BucketItem) => {
        const localIdentifier = get(item, ['measure', 'localIdentifier'], '');

        if (localIdentifier) {
            const metricIndex = measureGroupIdentifiers.indexOf(localIdentifier);
            result.push(metricIndex);
        }

        return result;
    }, []);
}

export function getComboChartSeries(
    config: IChartConfig,
    measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
    series: ISeriesItem[]
): ISeriesItem[] {
    const updatedSeries = cloneDeep(series);
    const measureBuckets = {};
    const types = [config.primaryChartType, config.secondaryChartType];
    const buckets = get(config, ['mdObject', 'buckets'], []);
    const measureGroupIdentifiers = measureGroup.items.map(
        (item: Execution.IMeasureHeaderItem) => get(item, ['measureHeaderItem', 'localIdentifier'], '')
    );

    buckets.forEach((bucket: VizObject.IBucket) => {
        const bucketItems = bucket.items || [];
        measureBuckets[bucket.localIdentifier] = getMeasureIndices(bucketItems, measureGroupIdentifiers);
    });

    [MEASURES, SECONDARY_MEASURES].forEach((name: string, index: number) => {
        (measureBuckets[name] || []).forEach((measureIndex: number) => {
            const chartType: string = CHART_ORDER[types[index]] ? types[index] : DEFAULT_COMBO_CHART_TYPES[index];

            set(updatedSeries, [measureIndex, 'type'], chartType);
            set(updatedSeries, [measureIndex, 'zIndex'], CHART_ORDER[chartType]);
        });
    });

    return updatedSeries;
}
