// (C) 2007-2019 GoodData Corporation
import {
    ComputeRatioRule,
    computeRatioRules,
    IAttribute,
    IFilter,
    IMeasure,
    newBucket,
    SortItem,
} from "@gooddata/sdk-model";
import * as React from "react";
import { MEASURES, SECONDARY_MEASURES, VIEW } from "../../base/constants/bucketNames";
import { sanitizeConfig2 } from "../../base/helpers/optionalStacking/common";
import { INewChartConfig } from "../../interfaces/Config";
import { defaultDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../chartProps";
import { CoreColumnChart } from "../columnChart/CoreColumnChart";
import { getCoreChartProps, IChartDefinition } from "../_commons/chartDefinition";
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import isArray = require("lodash/isArray");
import set = require("lodash/set");

//
// Public interface
//

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface IComboChartBucketProps {
    columnMeasures?: IMeasure[];
    lineMeasures?: IMeasure[];
    primaryMeasures?: IMeasure[];
    secondaryMeasures?: IMeasure[];
    viewBy?: IAttribute | IAttribute[];
    filters?: IFilter[];
    sortBy?: SortItem[];
}

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface IComboChartProps extends IBucketChartProps, IComboChartBucketProps {}

/**
 * [ComboChart](https://sdk.gooddata.com/gooddata-ui/docs/combo_chart_component.html)
 * is a component with bucket props primaryMeasures, secondaryMeasures, viewBy, filters
 *
 * @public
 */
export function ComboChart(props: IComboChartProps): JSX.Element {
    return <CoreColumnChart {...getProps(props)} />;
}

//
// Internals
//

const comboChartDefinition: IChartDefinition<IComboChartBucketProps, IComboChartProps> = {
    bucketPropsKeys: [
        "primaryMeasures",
        "secondaryMeasures",
        "columnMeasures",
        "lineMeasures",
        "viewBy",
        "filters",
        "sortBy",
    ],
    bucketsFactory: props => {
        const { primaryMeasures, secondaryMeasures, viewBy } = props;
        const categories = isArray(viewBy) ? [viewBy[0]] : [viewBy];

        return [
            newBucket(MEASURES, ...primaryMeasures),
            newBucket(SECONDARY_MEASURES, ...secondaryMeasures),
            newBucket(VIEW, ...categories),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("ComboChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withSorting(...props.sortBy)
            .withDimensions(defaultDimensions);
    },
    propOverridesFactory: props => {
        const comboProps = sanitizeComboProps(props);

        return {
            config: getConfiguration(comboProps),
        };
    },
};

const getProps = getCoreChartProps(comboChartDefinition);

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

function getConfiguration(props: IComboChartProps): INewChartConfig {
    const { primaryMeasures, secondaryMeasures, config } = props;
    const isDualAxis = get(props, "config.dualAxis", true);
    const measuresOnPrimaryAxis = isDualAxis ? primaryMeasures : [...primaryMeasures, ...secondaryMeasures];

    return sanitizeConfig2(measuresOnPrimaryAxis, config);
}
