// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import omit = require("lodash/omit");
import set = require("lodash/set");
import get = require("lodash/get");
import cloneDeep = require("lodash/cloneDeep");
import isArray = require("lodash/isArray");
import { VisualizationObject, VisualizationInput } from "@gooddata/typings";

import { Subtract } from "../typings/subtract";
import { ComboChart as AfmComboChart } from "./afm/ComboChart";
import { ICommonChartProps } from "./core/base/BaseChart";
import { convertBucketsToAFM, convertBucketsToMdObject } from "../helpers/conversion";
import { getResultSpec } from "../helpers/resultSpec";
import { MEASURES, SECONDARY_MEASURES, VIEW } from "../constants/bucketNames";
import { sanitizeConfig, sanitizeComputeRatioOnMeasures } from "../helpers/optionalStacking/common";
import { IChartConfig } from "../interfaces/Config";

export interface IComboChartBucketProps {
    columnMeasures?: VisualizationInput.IMeasure[];
    lineMeasures?: VisualizationInput.IMeasure[];
    primaryMeasures?: VisualizationInput.IMeasure[];
    secondaryMeasures?: VisualizationInput.IMeasure[];
    viewBy?: VisualizationInput.IAttribute | VisualizationInput.IAttribute[];
    filters?: VisualizationObject.VisualizationObjectFilter[];
    sortBy?: VisualizationInput.ISort[];
}

export interface IComboChartProps extends ICommonChartProps, IComboChartBucketProps {
    projectId: string;
}

type IComboChartNonBucketProps = Subtract<IComboChartProps, IComboChartBucketProps>;

/**
 * [ComboChart](https://sdk.gooddata.com/gooddata-ui/docs/combo_chart_component.html)
 * is a component with bucket props primaryMeasures, secondaryMeasures, viewBy, filters
 */
export function ComboChart(props: IComboChartProps): JSX.Element {
    const comboProps = sanitizeComboProps(props);
    const buckets = getBuckets(comboProps);
    const config = getConfiguration(buckets, comboProps);

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

    return (
        <AfmComboChart
            {...newProps}
            config={config}
            projectId={comboProps.projectId}
            afm={convertBucketsToAFM(buckets, comboProps.filters)}
            resultSpec={getResultSpec(buckets, comboProps.sortBy)}
        />
    );
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
    const disableComputeRatio = !isDualAxis && primaryMeasures.length + secondaryMeasures.length > 1;

    return {
        ...newProps,
        primaryMeasures: sanitizeComputeRatioOnMeasures(primaryMeasures, disableComputeRatio),
        secondaryMeasures: sanitizeComputeRatioOnMeasures(secondaryMeasures, disableComputeRatio),
    };
}

function getBuckets(props: IComboChartProps): VisualizationObject.IBucket[] {
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

function getConfiguration(buckets: VisualizationObject.IBucket[], props: IComboChartProps): IChartConfig {
    const { primaryMeasures, secondaryMeasures, filters, config } = props;
    const isDualAxis = get(props, "config.dualAxis", true);
    const measuresOnPrimaryAxis = isDualAxis ? primaryMeasures : [...primaryMeasures, ...secondaryMeasures];

    return sanitizeConfig(measuresOnPrimaryAxis, {
        ...config,
        mdObject: convertBucketsToMdObject(buckets, filters, "local:combo"),
    });
}
