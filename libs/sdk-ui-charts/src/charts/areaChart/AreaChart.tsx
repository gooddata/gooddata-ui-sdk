// (C) 2007-2019 GoodData Corporation
import {
    AttributeOrMeasure,
    applyRatioRule,
    IAttribute,
    IFilter,
    newBucket,
    SortItem,
} from "@gooddata/sdk-model";
import { truncate } from "../_commons/truncate";
import { IBucketChartProps, ViewByAttributesLimit } from "../../interfaces";
import { BucketNames } from "@gooddata/sdk-ui";
import { IChartConfig, sanitizeConfig } from "../../highcharts";
import { stackedChartDimensions } from "../_commons/dimensions";
import { CoreAreaChart } from "./CoreAreaChart";
import { IChartDefinition } from "../_commons/chartDefinition";
import isNil = require("lodash/isNil");
import { withChart } from "../_base/withChart";

//
// Internals
//

const areaChartDefinition: IChartDefinition<IAreaChartBucketProps, IAreaChartProps> = {
    bucketPropsKeys: ["measures", "viewBy", "stackBy", "filters", "sortBy"],
    bucketsFactory: props => {
        const { measures, viewBy, stackBy } = getBucketsProps(props);
        const sanitizedMeasures = applyRatioRule(measures);
        return [
            newBucket(BucketNames.MEASURES, ...sanitizedMeasures),
            newBucket(BucketNames.VIEW, ...viewBy),
            newBucket(BucketNames.STACK, ...stackBy),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("AreaChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withSorting(...props.sortBy)
            .withDimensions(stackedChartDimensions);
    },
    propOverridesFactory: (props, buckets) => {
        const config = getConfigProps(props);

        return {
            config: sanitizeConfig(buckets, config),
        };
    },
    onBeforePropsConversion: verifyBuckets,
};

function getStackConfiguration(config: IChartConfig = {}): IChartConfig {
    const { stackMeasures, stackMeasuresToPercent } = config;
    if (isNil(stackMeasures) && isNil(stackMeasuresToPercent)) {
        return config;
    }
    return {
        ...config,
        stacking: Boolean(stackMeasuresToPercent) || Boolean(stackMeasures),
    };
}

export function getBucketsProps(
    props: IAreaChartBucketProps,
): {
    measures: AttributeOrMeasure[];
    viewBy: IAttribute[];
    stackBy: IAttribute[];
} {
    const { measures, stackBy } = props;
    const viewBy = truncate(props.viewBy, ViewByAttributesLimit);

    if (viewBy.length <= 1) {
        return {
            measures: measures || [],
            viewBy,
            stackBy: stackBy ? [stackBy] : [],
        };
    }

    // for case viewBy 2 attributes
    const [firstMeasure] = measures; // only take first measure
    const [firstAttribute, secondAttribute] = viewBy; // only take first two attributes

    return {
        measures: [firstMeasure],
        viewBy: [firstAttribute], // one attribute for viewBy which slices measure vertically
        stackBy: [secondAttribute], // one attribute for stackBy which slices measure horizontally
    };
}

export function getConfigProps(props: IAreaChartProps): IChartConfig {
    const viewBy = truncate(props.viewBy, ViewByAttributesLimit);
    if (viewBy.length <= 1) {
        return getStackConfiguration(props.config);
    }

    return {
        ...props.config,
        stacking: false, // area sections are always overlapped with two attributes
        stackMeasures: false,
        stackMeasuresToPercent: false,
    };
}

/**
 * Show warning to SDK user in console log
 * @param props
 */
export function verifyBuckets(props: IAreaChartProps): void {
    const viewBy = truncate(props.viewBy, ViewByAttributesLimit);
    if (viewBy.length <= 1) {
        return;
    }

    const { measures = [], stackBy } = props;
    if (measures.length > 1 || stackBy) {
        // tslint:disable-next-line: no-console
        console.warn(
            "When there are two attributes in viewBy, only first measure is taken and attribute in stackBy is ignored",
        );
    }
}

//
// Public interface
//

/**
 * TODO: SDK8: describe buckets
 *
 * @public
 */
export interface IAreaChartBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute | IAttribute[];
    stackBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

/**
 * @public
 */
export interface IAreaChartProps extends IBucketChartProps, IAreaChartBucketProps {}

/**
 * [AreaChart](http://sdk.gooddata.com/gooddata-ui/docs/area_chart_component.html)
 * is a component with bucket props measures, viewBy, stacksBy, filters
 *
 * @remarks See {@link IAreaChartProps} to learn how it is possible to configure the AreaChart
 * @public
 */
export const AreaChart = withChart(areaChartDefinition)(CoreAreaChart);
