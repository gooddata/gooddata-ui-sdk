// (C) 2019 GoodData Corporation
import {
    AttributeOrMeasure,
    computeRatioRules,
    IAttribute,
    IFilter,
    newBucket,
    SortItem,
} from "@gooddata/sdk-model";
import * as React from "react";
import { ATTRIBUTE, MEASURES, STACK } from "../../base/constants/bucketNames";
import { IBucketChartProps } from "../chartProps";
import { truncate } from "../_commons/truncate";
import { VIEW_BY_ATTRIBUTES_LIMIT } from "../../base/constants/limits";
import { sanitizeConfig2 } from "../../highcharts/utils/optionalStacking/common";
import { CoreBarChart } from "./CoreBarChart";
import { stackedChartDimensions } from "../_commons/dimensions";
import { getCoreChartProps, IChartDefinition } from "../_commons/chartDefinition";

//
// Public interface
//

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IBarChartBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute | IAttribute[];
    stackBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IBarChartProps extends IBarChartBucketProps, IBucketChartProps {
    workspace: string;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export function BarChart(props: IBarChartProps): JSX.Element {
    return <CoreBarChart {...getProps(props)} />;
}

//
// Internals
//

const barChartDefinition: IChartDefinition<IBarChartBucketProps, IBarChartProps> = {
    bucketPropsKeys: ["measures", "viewBy", "stackBy", "filters", "sortBy"],
    bucketsFactory: props => {
        const measures = computeRatioRules(props.measures);
        const viewBy = truncate(props.viewBy, VIEW_BY_ATTRIBUTES_LIMIT);

        return [
            newBucket(MEASURES, ...measures),
            newBucket(ATTRIBUTE, ...viewBy),
            newBucket(STACK, props.stackBy),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("BarChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withSorting(...props.sortBy)
            .withDimensions(stackedChartDimensions);
    },
    propOverridesFactory: (props, buckets) => {
        return {
            config: sanitizeConfig2(buckets, props.config),
        };
    },
};

const getProps = getCoreChartProps(barChartDefinition);
