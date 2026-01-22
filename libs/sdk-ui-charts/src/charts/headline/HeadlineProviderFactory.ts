// (C) 2023-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IBucket, type IMeasure, bucketMeasure, bucketMeasures, bucketsFind } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { type IHeadlineProvider } from "./HeadlineProvider.js";
import { ComparisonProvider } from "./internal/providers/ComparisonProvider.js";
import { MultiMeasuresProvider } from "./internal/providers/MultiMeasuresProvider.js";
import { type IChartConfig } from "../../interfaces/chartConfig.js";
import { type IComparison } from "../../interfaces/comparison.js";

enum HeadlineType {
    MULTI_MEASURES,
    COMPARISON,
}

/**
 * Factory method to create a specific HeadlineProvider based on the provided buckets and chart configuration.
 *
 * @returns An instance of the IHeadlineProvider interface that corresponds headline business.
 *
 * @internal
 */
const createHeadlineProvider = (buckets: IBucket[], config: IChartConfig | undefined): IHeadlineProvider => {
    const headlineType = getHeadlineType(buckets, config);
    if (headlineType === HeadlineType.COMPARISON) {
        return new ComparisonProvider(config?.comparison);
    }

    return new MultiMeasuresProvider();
};

const getHeadlineType = (buckets: IBucket[], config: IChartConfig | undefined): HeadlineType => {
    const measureBucket = bucketsFind(buckets, BucketNames.MEASURES);
    const primaryMeasure = measureBucket ? bucketMeasure(measureBucket) : undefined;

    const secondaryBucket = bucketsFind(buckets, BucketNames.SECONDARY_MEASURES);
    const secondaryMeasures = isEmpty(secondaryBucket) ? [] : bucketMeasures(secondaryBucket);

    if (isComparisonType(primaryMeasure, secondaryMeasures, config?.comparison)) {
        return HeadlineType.COMPARISON;
    }

    return HeadlineType.MULTI_MEASURES;
};

const isComparisonType = (
    primaryMeasure: IMeasure | undefined,
    secondaryMeasures: IMeasure[],
    comparison?: IComparison,
): boolean => {
    const isComparisonEnabled = comparison?.enabled ?? true;
    return !!primaryMeasure && secondaryMeasures?.length === 1 && isComparisonEnabled;
};

/**
 * NOTE: exported to satisfy sdk-ui-ext; is internal, must not be used outside of SDK; will disapppear.
 */
export { createHeadlineProvider };
