// (C) 2023-2025 GoodData Corporation

import { ComponentType } from "react";

import { clone, isEmpty } from "lodash-es";

import { IExecutionFactory, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IBucket, MeasureGroupIdentifier, newDimension } from "@gooddata/sdk-model";

import {
    ICreateExecutionParams,
    IHeadlineProvider,
    IHeadlineTransformationProps,
} from "../../HeadlineProvider.js";

export abstract class AbstractProvider implements IHeadlineProvider {
    public createExecution(
        executionFactory: IExecutionFactory,
        params: ICreateExecutionParams,
    ): IPreparedExecution {
        const { buckets, filters, executionConfig, dateFormat, sortItems } = params;
        const execution = executionFactory
            .forBuckets(this.prepareBuckets(clone(buckets)), filters)
            .withExecConfig(executionConfig)
            .withDimensions(newDimension([MeasureGroupIdentifier]));

        if (dateFormat) {
            execution.withDateFormat(dateFormat);
        }

        if (!isEmpty(sortItems)) {
            execution.withSorting(...sortItems);
        }

        return execution;
    }

    public abstract getHeadlineTransformationComponent(): ComponentType<IHeadlineTransformationProps>;

    protected prepareBuckets(originalBuckets: IBucket[]): IBucket[] {
        return originalBuckets;
    }
}
