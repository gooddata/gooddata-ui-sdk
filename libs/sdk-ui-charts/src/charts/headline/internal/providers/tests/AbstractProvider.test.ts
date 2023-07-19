// (C) 2023 GoodData Corporation
import { describe, it, expect } from "vitest";
import { ReferenceMd } from "@gooddata/reference-workspace";
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
import { IExecutionFactory } from "@gooddata/sdk-backend-spi";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import MockProvider from "./MockProvider.js";

describe("AbstractProvider", () => {
    const provider = new MockProvider();

    describe("createExecution", () => {
        const executionFactory: IExecutionFactory = dummyBackend().workspace("PROJECTID").execution();
        const buckets: IBucket[] = [
            newBucket(BucketNames.MEASURES, ReferenceMd.Amount),
            newBucket(BucketNames.SECONDARY_MEASURES, ReferenceMd.Amount_1.Sum),
        ];
        const filters: IFilter[] = [newPositiveAttributeFilter(ReferenceMd.Account.Name, [])];
        const sortItems: ISortItem[] = [newMeasureSort(ReferenceMd.Amount, "desc")];
        const executionConfig: IExecutionConfig = {
            dataSamplingPercentage: 50,
        };
        const dateFormat = "MM/DD/YYYY";

        it("execution should be created", () => {
            const execution = provider.createExecution(executionFactory, {
                buckets,
                filters,
                executionConfig,
                dateFormat,
                sortItems,
            });

            expect(execution).toMatchSnapshot();
        });

        it("execution should be created without dateFormat and sortItems", () => {
            const execution = provider.createExecution(executionFactory, {
                buckets,
                filters,
                executionConfig,
            });

            expect(execution).toMatchSnapshot();
        });
    });
});
