// (C) 2023 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import clone from "lodash/clone.js";

import { IExecutionFactory, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IBucket, MeasureGroupIdentifier, newDimension } from "@gooddata/sdk-model";

import {
    ICreateExecutionParams,
    IHeadlineProvider,
    IHeadlineTransformationProps,
} from "../../HeadlineProvider.js";

abstract class AbstractProvider implements IHeadlineProvider {
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

    public abstract getHeadlineTransformationComponent(): React.ComponentType<IHeadlineTransformationProps>;

    protected prepareBuckets(originalBuckets: IBucket[]): IBucket[] {
        return originalBuckets;
    }
}

export default AbstractProvider;
