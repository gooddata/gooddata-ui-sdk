// (C) 2007-2019 GoodData Corporation
import { AttributeOrMeasure, IAttribute, IFilter, SortItem, computeRatioRules } from "@gooddata/sdk-model";
import * as React from "react";
import { truncate } from "../../components/exp/chartUtils";
import { ICommonChartProps } from "../chartProps";
import { VIEW_BY_ATTRIBUTES_LIMIT } from "../../components/visualizations/chart/constants";
import { ATTRIBUTE, MEASURES, STACK } from "../../constants/bucketNames";
import { sanitizeConfig2 } from "../../helpers/optionalStacking/common";
import { INewChartConfig } from "../../interfaces/Config";
import { stackedChartDimensions } from "../_commons/dimensions";
import { CoreAreaChart } from "./CoreAreaChart";
import isNil from "lodash/isNil";
import { IChartDefinition, getCoreChartProps } from "../_commons/chartDefinition";

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

const areaChartDefinition: IChartDefinition<IAreaChartBucketProps, IAreaChartProps> = {
    bucketPropsKeys: ["measures", "viewBy", "stackBy", "filters", "sortBy"],
    bucketsFactory: props => {
        const { measures, viewBy, stackBy } = getBucketsProps(props);
        const sanitizedMeasures = computeRatioRules(measures);
        return [
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
            config: sanitizeConfig2(buckets, config),
        };
    },
    onBeforePropsConversion: verifyBuckets,
};

const getProps = getCoreChartProps(areaChartDefinition);

/**
 * [AreaChart](http://sdk.gooddata.com/gooddata-ui/docs/area_chart_component.html)
 * is a component with bucket props measures, viewBy, stacksBy, filters
 */
export function AreaChart(props: IAreaChartProps): JSX.Element {
    return <CoreAreaChart {...getProps(props)} />;
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
    props: IAreaChartBucketProps,
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
    const viewBy = truncate(props.viewBy, VIEW_BY_ATTRIBUTES_LIMIT);
    if (viewBy.length <= 1) {
        return;
    }

    const { measures = [], stackBy } = props;
    if (measures.length > 1 || stackBy) {
        console.warn(
            "When there are two attributes in viewBy, only first measure is taken and attribute in stackBy is ignored",
        );
    }
}
