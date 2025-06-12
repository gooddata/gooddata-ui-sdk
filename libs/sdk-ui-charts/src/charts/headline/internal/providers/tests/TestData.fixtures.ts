// (C) 2023 GoodData Corporation
import { IExecutionFactory } from "@gooddata/sdk-backend-spi";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    IBucket,
    IExecutionConfig,
    IFilter,
    ISortItem,
    newBucket,
    newMeasureSort,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { ReferenceMd } from "@gooddata/reference-workspace";

export const TEST_EXECUTION_FACTORY: IExecutionFactory = dummyBackend().workspace("PROJECTID").execution();
export const TEST_BUCKETS: IBucket[] = [
    newBucket(BucketNames.MEASURES, ReferenceMd.Amount),
    newBucket(BucketNames.SECONDARY_MEASURES, ReferenceMd.Amount_1.Sum),
];
export const TEST_FILTERS: IFilter[] = [newPositiveAttributeFilter(ReferenceMd.Account.Name, [])];
export const TEST_SORT_ITEMS: ISortItem[] = [newMeasureSort(ReferenceMd.Amount, "desc")];
export const TEST_EXECUTION_CONFIG: IExecutionConfig = {
    dataSamplingPercentage: 50,
};
export const TEST_DATE_FORMAT = "MM/DD/YYYY";
