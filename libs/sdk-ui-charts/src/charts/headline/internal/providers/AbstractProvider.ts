// (C) 2023 GoodData Corporation
import {
    ICreateExecutionParams,
    IHeadlineProvider,
    IHeadlineTransformationProps,
} from "../../HeadlineProvider.js";
import { IExecutionFactory, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import isEmpty from "lodash/isEmpty.js";
import { MeasureGroupIdentifier, newDimension } from "@gooddata/sdk-model";

abstract class AbstractProvider implements IHeadlineProvider {
    public createExecution(
        executionFactory: IExecutionFactory,
        params: ICreateExecutionParams,
    ): IPreparedExecution {
        const { buckets, filters, executionConfig, dateFormat, sortItems } = params;
        const execution = executionFactory
            .forBuckets(buckets, filters)
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
}

export default AbstractProvider;
