// (C) 2019 GoodData Corporation
/* tslint:disable */
import {
    AttributeOrMeasure,
    computeRatioRules,
    IAttribute,
    IBucket,
    IFilter,
    SortItem,
} from "@gooddata/sdk-model";
import { ATTRIBUTE, MEASURES, STACK } from "../../constants/bucketNames";
import { sanitizeConfig } from "../../helpers/optionalStacking/common";
import { Subtract } from "../../typings/subtract";
import { VIEW_BY_ATTRIBUTES_LIMIT } from "../visualizations/chart/constants";
import { truncate } from "./chartUtils";
import { ICommonChartProps } from "./props";
import omit = require("lodash/omit");

export interface IBarChartBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute | IAttribute[];
    stackBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

export interface IBarChartProps extends IBarChartBucketProps, ICommonChartProps {}

type IBarChartNonBucketProps = Subtract<IBarChartProps, IBarChartBucketProps>;

export function BarChart(props: IBarChartProps): JSX.Element {
    const measures = computeRatioRules(props.measures);
    const viewBy = truncate(props.viewBy, VIEW_BY_ATTRIBUTES_LIMIT);
    const stackBy = props.stackBy ? [props.stackBy] : [];

    // @ts-ignore
    const buckets: IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: measures,
        },
        {
            localIdentifier: ATTRIBUTE,
            items: viewBy, // could be one or two attributes
        },
        {
            localIdentifier: STACK,
            items: stackBy,
        },
    ];

    // TODO: SDK8: can this be done without repeating the prop names?
    const newProps: IBarChartNonBucketProps = omit<IBarChartProps, keyof IBarChartBucketProps>(props, [
        "measures",
        "viewBy",
        "stackBy",
        "filters",
        "sortBy",
    ]);

    // @ts-ignore
    const sanitizedConfig = sanitizeConfig(measures, newProps.config);

    return null;
    /*

    return (
        <AfmBarChart
            {...newProps}
            config={sanitizedConfig}
            projectId={props.projectId}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getStackingResultSpec(buckets, props.sortBy)}
        />
    );*/
}
