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
import { sanitizeConfig2 } from "../../highcharts/utils/optionalStacking/common";
import { IChartConfig } from "../../highcharts";
import { defaultDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../chartProps";
import { getCoreChartProps, IChartDefinition } from "../_commons/chartDefinition";
import { CoreComboChart } from "./CoreComboChart";
import get = require("lodash/get");
import isArray = require("lodash/isArray");

//
// Public interface
//

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface IComboChartBucketProps {
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
    return <CoreComboChart {...getProps(props)} />;
}

//
// Internals
//

const comboChartDefinition: IChartDefinition<IComboChartBucketProps, IComboChartProps> = {
    bucketPropsKeys: ["primaryMeasures", "secondaryMeasures", "viewBy", "filters", "sortBy"],
    propTransformation: props => {
        const { primaryMeasures = [], secondaryMeasures = [] } = props;
        const isDualAxis = get(props, "config.dualAxis", true);
        const computeRatioRule =
            !isDualAxis && primaryMeasures.length + secondaryMeasures.length > 1
                ? ComputeRatioRule.NEVER
                : ComputeRatioRule.SINGLE_MEASURE_ONLY;

        return {
            ...props,
            primaryMeasures: computeRatioRules(primaryMeasures, computeRatioRule),
            secondaryMeasures: computeRatioRules(secondaryMeasures, computeRatioRule),
        };
    },
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
        return {
            config: getConfiguration(props),
        };
    },
};

const getProps = getCoreChartProps(comboChartDefinition);

function getConfiguration(props: IComboChartProps): IChartConfig {
    const { primaryMeasures, secondaryMeasures, config } = props;
    const isDualAxis = get(props, "config.dualAxis", true);
    const measuresOnPrimaryAxis = isDualAxis ? primaryMeasures : [...primaryMeasures, ...secondaryMeasures];

    return sanitizeConfig2(measuresOnPrimaryAxis, config);
}
