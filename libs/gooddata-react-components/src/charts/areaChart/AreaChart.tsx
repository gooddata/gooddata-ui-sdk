// (C) 2007-2019 GoodData Corporation
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    AttributeOrMeasure,
    IAttribute,
    IFilter,
    SortItem,
    IBucket,
    computeRatioRules,
} from "@gooddata/sdk-model";
import * as React from "react";
import { truncate } from "../../components/exp/chartUtils";
import { IChartProps, ICommonChartProps } from "../../components/exp/props";
import { VIEW_BY_ATTRIBUTES_LIMIT } from "../../components/visualizations/chart/constants";
import { ATTRIBUTE, MEASURES, STACK } from "../../constants/bucketNames";
import { sanitizeConfig2 } from "../../helpers/optionalStacking/common";
import { INewChartConfig } from "../../interfaces/Config";
import { Subtract } from "../../typings/subtract";
import { stackedChartDimensions } from "../dimensions";
import { CoreAreaChart } from "./CoreAreaChart";
import isNil = require("lodash/isNil");
import omit = require("lodash/omit");

export interface IAreaChartBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute | IAttribute[];
    stackBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

export interface IAreaChartProps extends ICommonChartProps, IAreaChartBucketProps {
    workspace: string;
}

type IAreaChartNonBucketProps = Subtract<IAreaChartProps, IAreaChartBucketProps>;

/**
 * [AreaChart](http://sdk.gooddata.com/gooddata-ui/docs/area_chart_component.html)
 * is a component with bucket props measures, viewBy, stacksBy, filters
 */
export function AreaChart(props: IAreaChartProps): JSX.Element {
    return <CoreAreaChart {...toCoreAreaChartProps(props)} />;
}

export function toCoreAreaChartProps(props: IAreaChartProps): IChartProps {
    verifyBuckets(props);

    const { measures, viewBy, stackBy } = getBucketsProps(props);
    const sanitizedMeasures = computeRatioRules(measures);
    const configProp = getConfigProps(props);

    const buckets: IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: sanitizedMeasures,
        },
        {
            localIdentifier: ATTRIBUTE,
            items: viewBy,
        },
        {
            localIdentifier: STACK,
            items: stackBy,
        },
    ];

    const newProps: IAreaChartNonBucketProps = omit<IAreaChartProps, keyof IAreaChartBucketProps>(props, [
        "measures",
        "viewBy",
        "stackBy",
        "filters",
        "sortBy",
    ]);
    const sanitizedConfig = sanitizeConfig2(buckets, {
        ...newProps.config,
        ...configProp,
    });

    return {
        ...newProps,
        config: sanitizedConfig,
        execution: createExecution(buckets, props),
    };
}

export function createExecution(buckets: IBucket[], props: IAreaChartProps): IPreparedExecution {
    const { backend, workspace } = props;

    return backend
        .withTelemetry("AreaChart", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters)
        .withSorting(...props.sortBy)
        .withDimensions(stackedChartDimensions);
}

function getStackConfiguration(config: INewChartConfig = {}): INewChartConfig {
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
    props: IAreaChartProps,
): {
    measures: AttributeOrMeasure[];
    viewBy: IAttribute[];
    stackBy: IAttribute[];
} {
    const { measures, stackBy } = props;
    const viewBy = truncate(props.viewBy, VIEW_BY_ATTRIBUTES_LIMIT);

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

export function getConfigProps(props: IAreaChartProps): INewChartConfig {
    const viewBy = truncate(props.viewBy, VIEW_BY_ATTRIBUTES_LIMIT);
    if (viewBy.length <= 1) {
        return getStackConfiguration(props.config);
    }

    return {
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
    const viewBy = truncate(props.viewBy, VIEW_BY_ATTRIBUTES_LIMIT);
    if (viewBy.length <= 1) {
        return;
    }

    const { measures = [], stackBy } = props;
    if (measures.length > 1 || stackBy) {
        // tslint:disable-next-line:no-console max-line-length
        console.warn(
            "When there are two attributes in viewBy, only first measure is taken and attribute in stackBy is ignored",
        );
    }
}
