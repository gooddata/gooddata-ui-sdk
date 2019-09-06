// (C) 2007-2018 GoodData Corporation
import { IAttribute, IFilter, IMeasure, SortItem } from "@gooddata/sdk-model";
import * as React from "react";
import { ATTRIBUTE, MEASURES, SECONDARY_MEASURES } from "../../constants/bucketNames";
import { pointyChartDimensions } from "../_commons/dimensions";
import { ICommonChartProps } from "../chartProps";
import { CoreScatterPlot } from "./CoreScatterPlot";
import { IChartDefinition, getCoreChartProps } from "../_commons/chartDefinition";

export interface IScatterPlotBucketProps {
    xAxisMeasure?: IMeasure;
    yAxisMeasure?: IMeasure;
    attribute?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[]; // TODO would it be removed? if not dont forget to test
}

export interface IScatterPlotProps extends ICommonChartProps, IScatterPlotBucketProps {
    workspace: string;
}

const scatterPlotDefinition: IChartDefinition<IScatterPlotBucketProps, IScatterPlotProps> = {
    bucketPropsKeys: ["xAxisMeasure", "yAxisMeasure", "attribute", "filters", "sortBy"],
    bucketsFactory: props => {
        return [
            {
                localIdentifier: MEASURES,
                items: props.xAxisMeasure ? [props.xAxisMeasure] : [],
            },
            {
                localIdentifier: SECONDARY_MEASURES,
                items: props.yAxisMeasure ? [props.yAxisMeasure] : [],
            },
            {
                localIdentifier: ATTRIBUTE,
                items: props.attribute ? [props.attribute] : [],
            },
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("ScatterPlot", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withDimensions(pointyChartDimensions);
    },
};

const getProps = getCoreChartProps(scatterPlotDefinition);

/**
 * [ScatterPlot](http://sdk.gooddata.com/gooddata-ui/docs/scatter_plot_component.html)
 * is a component with bucket props xAxisMeasure, yAxisMeasure, attribute, filters
 */
export function ScatterPlot(props: IScatterPlotProps): JSX.Element {
    return <CoreScatterPlot {...getProps(props)} />;
}
