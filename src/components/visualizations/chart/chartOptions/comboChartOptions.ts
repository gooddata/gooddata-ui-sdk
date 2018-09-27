// (C) 2007-2018 GoodData Corporation
import { MEASURES, SECONDARY_MEASURES } from '../../../../constants/bucketNames';

export function getComboChartOptions(
    config: any,
    measureGroup: any,
    series: any,
    categories: any
) {
    const { mdObject } = config;
    const measureGroupIdentifiers = measureGroup.items.map((item: any) =>
        item.measureHeaderItem.localIdentifier);
    const measureBuckets = {};

    if (mdObject) {
        mdObject.buckets.forEach((bucket: any) => {
            const bucketItems = bucket.items;
            const metricIndexes: number[] = [];
            bucketItems.forEach((item: any) => {
               if (item.measure) {
                 const metricIndex = measureGroupIdentifiers.indexOf(item.measure.localIdentifier);
                 metricIndexes.push(metricIndex);
               }
            });
            measureBuckets[bucket.localIdentifier] = metricIndexes;
        });
    }

    if (measureBuckets[MEASURES]) {
        measureBuckets[MEASURES].forEach((measureIndex: number) => {
            series[measureIndex].type = 'column';
        });
    }

    if (measureBuckets[SECONDARY_MEASURES]) {
        measureBuckets[SECONDARY_MEASURES].forEach((measureIndex: number) => {
            series[measureIndex].type = 'line';
        });
    }

    return {
        data: {
            series,
            categories
        }
    };
}
