// (C) 2007-2019 GoodData Corporation
import { VisualizationInput, VisualizationObject } from "@gooddata/typings";
import * as React from "react";
import { IChartConfig } from "..";
import { ATTRIBUTE, MEASURES, STACK } from "../constants/bucketNames";
import { convertBucketsToAFM } from "../helpers/conversion";
import {
    getViewByTwoAttributes,
    sanitizeComputeRatioOnMeasures,
    sanitizeConfig,
} from "../helpers/optionalStacking/common";
import { getStackingResultSpec } from "../helpers/resultSpec";
import { Subtract } from "../typings/subtract";
import { AreaChart as AfmAreaChart } from "./afm/AreaChart";
import { ICommonChartProps } from "./core/base/BaseChart";
import isNil = require("lodash/isNil");
import omit = require("lodash/omit");
import BucketItem = VisualizationObject.BucketItem;
import IVisualizationAttribute = VisualizationObject.IVisualizationAttribute;

export interface IAreaChartBucketProps {
    measures: VisualizationInput.AttributeOrMeasure[];
    viewBy?: VisualizationInput.IAttribute | VisualizationInput.IAttribute[];
    stackBy?: VisualizationInput.IAttribute;
    filters?: VisualizationInput.IFilter[];
    sortBy?: VisualizationInput.ISort[];
}

export interface IAreaChartProps extends ICommonChartProps, IAreaChartBucketProps {
    projectId: string;
}

type IAreaChartNonBucketProps = Subtract<IAreaChartProps, IAreaChartBucketProps>;

/**
 * [AreaChart](http://sdk.gooddata.com/gooddata-ui/docs/area_chart_component.html)
 * is a component with bucket props measures, viewBy, stacksBy, filters
 */
export function AreaChart(props: IAreaChartProps): JSX.Element {
    verifyBuckets(props);

    const { measures, viewBy, stackBy } = getBucketsProps(props);
    const sanitizedMeasures = sanitizeComputeRatioOnMeasures(measures);
    const configProp = getConfigProps(props);

    const buckets: VisualizationObject.IBucket[] = [
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
    const sanitizedConfig = sanitizeConfig(measures, {
        ...newProps.config,
        ...configProp,
    });

    return (
        <AfmAreaChart
            {...newProps}
            config={sanitizedConfig}
            projectId={props.projectId}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getStackingResultSpec(buckets, props.sortBy)}
        />
    );
}

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
    props: IAreaChartProps,
): {
    measures: BucketItem[];
    viewBy: IVisualizationAttribute[];
    stackBy: IVisualizationAttribute[];
} {
    const { measures, stackBy } = props;
    const viewBy = getViewByTwoAttributes(props.viewBy);

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
    const viewBy = getViewByTwoAttributes(props.viewBy);
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
    const viewBy = getViewByTwoAttributes(props.viewBy);
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
