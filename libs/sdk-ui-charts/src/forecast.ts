// (C) 2022-2024 GoodData Corporation

import { insightBuckets, bucketsFind, IInsightDefinition } from "@gooddata/sdk-model";
import { BucketNames, ChartType } from "@gooddata/sdk-ui";

/**
 * @beta
 * Check if the forecast is enabled for the insight and chart type
 */
export function isForecastEnabled(
    insight: IInsightDefinition,
    type: ChartType,
): {
    enabled: boolean;
    visible: boolean;
} {
    switch (type) {
        case "line": {
            const buckets = insightBuckets(insight);
            const measures = bucketsFind(buckets, (b) => b.localIdentifier === BucketNames.MEASURES);
            const trends = bucketsFind(buckets, (b) => b.localIdentifier === BucketNames.TREND);

            //TODO: s.hacker check if the trend is date attribute somehow
            return {
                enabled: measures?.items.length === 1 && trends?.items.length === 1,
                visible: true,
            };
        }
        case "column":
        default:
            return {
                enabled: false,
                visible: false,
            };
    }
}
