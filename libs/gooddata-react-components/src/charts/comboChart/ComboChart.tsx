// (C) 2007-2019 GoodData Corporation
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    ComputeRatioRule,
    computeRatioRules,
    IAttribute,
    IBucket,
    IFilter,
    IMeasure,
    SortItem,
} from "@gooddata/sdk-model";
import * as React from "react";
import { MEASURES, SECONDARY_MEASURES, VIEW } from "../../constants/bucketNames";
import { sanitizeConfig2 } from "../../helpers/optionalStacking/common";
import { INewChartConfig } from "../../interfaces/Config";
import { Subtract } from "../../typings/subtract";
import { defaultDimensions } from "../_commons/dimensions";
import { IChartProps, ICommonChartProps } from "../chartProps";
import { CoreColumnChart } from "../columnChart/CoreColumnChart";
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import isArray = require("lodash/isArray");
import omit = require("lodash/omit");
import set = require("lodash/set");

export interface IComboChartBucketProps {
    columnMeasures?: IMeasure[];
    lineMeasures?: IMeasure[];
    primaryMeasures?: IMeasure[];
    secondaryMeasures?: IMeasure[];
    viewBy?: IAttribute | IAttribute[];
    filters?: IFilter[];
    sortBy?: SortItem[];
}

export interface IComboChartProps extends ICommonChartProps, IComboChartBucketProps {
    workspace: string;
}

type IComboChartNonBucketProps = Subtract<IComboChartProps, IComboChartBucketProps>;

/**
 * [ComboChart](https://sdk.gooddata.com/gooddata-ui/docs/combo_chart_component.html)
 * is a component with bucket props primaryMeasures, secondaryMeasures, viewBy, filters
 */
export function ComboChart(props: IComboChartProps): JSX.Element {
    return <CoreColumnChart {...toCoreComboChartProps(props)} />;
}

export function toCoreComboChartProps(props: IComboChartProps): IChartProps {
    const comboProps = sanitizeComboProps(props);
    const buckets = getBuckets(comboProps);
    const config = getConfiguration(comboProps);

    const newProps: IComboChartNonBucketProps = omit<IComboChartProps, keyof IComboChartBucketProps>(
        comboProps,
        [
            "primaryMeasures",
            "secondaryMeasures",
            "columnMeasures",
            "lineMeasures",
            "viewBy",
            "filters",
            "sortBy",
        ],
    );

    return {
        ...newProps,
        config,
        execution: createExecution(buckets, props),
    };
}

export function createExecution(buckets: IBucket[], props: IComboChartProps): IPreparedExecution {
    const { backend, workspace } = props;

    return backend
        .withTelemetry("ComboChart", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters)
        .withSorting(...props.sortBy)
        .withDimensions(defaultDimensions);
}

function deprecateOldProps(props: IComboChartProps): IComboChartProps {
    const clonedProps = cloneDeep(props);
    const { columnMeasures, lineMeasures } = clonedProps;
    const isOldConfig = Boolean(columnMeasures || lineMeasures);

    if (isOldConfig) {
        set(clonedProps, "primaryMeasures", columnMeasures);
        set(clonedProps, "secondaryMeasures", lineMeasures);
        set(clonedProps, "config.dualAxis", false);

        // tslint:disable-next-line:no-console
        console.warn(
            "Props columnMeasures and lineMeasures are deprecated. Please migrate to props primaryMeasures and secondaryMeasures.",
        );
    }

    return clonedProps;
}

function sanitizeComboProps(props: IComboChartProps): IComboChartProps {
    const newProps = deprecateOldProps(props);
    const { primaryMeasures = [], secondaryMeasures = [] } = newProps;
    const isDualAxis = get(props, "config.dualAxis", true);
    const computeRatioRule =
        !isDualAxis && primaryMeasures.length + secondaryMeasures.length > 1
            ? ComputeRatioRule.NEVER
            : ComputeRatioRule.SINGLE_MEASURE_ONLY;

    return {
        ...newProps,
        primaryMeasures: computeRatioRules(primaryMeasures, computeRatioRule),
        secondaryMeasures: computeRatioRules(secondaryMeasures, computeRatioRule),
    };
}

function getBuckets(props: IComboChartProps): IBucket[] {
    const { primaryMeasures, secondaryMeasures, viewBy } = props;
    const categories = isArray(viewBy) ? [viewBy[0]] : [viewBy];

    return [
        {
            localIdentifier: MEASURES,
            items: primaryMeasures,
        },
        {
            localIdentifier: SECONDARY_MEASURES,
            items: secondaryMeasures,
        },
        {
            localIdentifier: VIEW,
            items: categories,
        },
    ];
}

function getConfiguration(props: IComboChartProps): INewChartConfig {
    const { primaryMeasures, secondaryMeasures, config } = props;
    const isDualAxis = get(props, "config.dualAxis", true);
    const measuresOnPrimaryAxis = isDualAxis ? primaryMeasures : [...primaryMeasures, ...secondaryMeasures];

    return sanitizeConfig2(measuresOnPrimaryAxis, config);
}
