// (C) 2023-2025 GoodData Corporation
import { IDataView, IExecutionFactory, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IBucket, IExecutionConfig, IFilter, ISortItem } from "@gooddata/sdk-model";
import { ExplicitDrill, IDrillEventCallback } from "@gooddata/sdk-ui";

import { IChartConfig } from "../../interfaces/index.js";

/**
 * @internal
 */
interface IHeadlineTransformationProps {
    dataView: IDataView;
    drillableItems?: ExplicitDrill[];
    config?: IChartConfig;
    onDrill?: IDrillEventCallback;
    onAfterRender?: () => void;
}

/**
 * @internal
 */
interface ICreateExecutionParams {
    buckets: IBucket[];
    filters: IFilter[];
    executionConfig: IExecutionConfig;
    dateFormat?: string;
    sortItems?: ISortItem[];
}

/**
 * This interface defines the contract for classes that provide headline-related functionality in the Headline.
 * Headlines consist of multiple visuals, each displaying different content, and each visual has a unique execution associated with it.
 *
 * @internal
 */
interface IHeadlineProvider {
    /**
     * Creates a execution for the core headline based on the provided parameters.
     */
    createExecution(executionFactory: IExecutionFactory, params: ICreateExecutionParams): IPreparedExecution;

    /**
     * Retrieves the headline transformation component responsible for rendering visuals associated with the headline.
     *
     * @returns The component responsible for rendering visuals in the headline.
     */
    getHeadlineTransformationComponent: () => React.ComponentType<IHeadlineTransformationProps>;
}

/**
 * NOTE: exported to satisfy sdk-ui-ext; is internal, must not be used outside of SDK; will disapppear.
 */
export type { IHeadlineProvider, IHeadlineTransformationProps, ICreateExecutionParams };
