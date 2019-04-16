// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import omit = require("lodash/omit");
import set = require("lodash/set");
import cloneDeep = require("lodash/cloneDeep");
import isArray = require("lodash/isArray");
import { Subtract } from "utility-types";
import { VisualizationObject, VisualizationInput } from "@gooddata/typings";

import { ComboChart as AfmComboChart } from "./afm/ComboChart";
import { ICommonChartProps } from "./core/base/BaseChart";
import { convertBucketsToAFM, convertBucketsToMdObject } from "../helpers/conversion";
import { getResultSpec } from "../helpers/resultSpec";
import { MEASURES, SECONDARY_MEASURES, VIEW } from "../constants/bucketNames";
import { setMeasuresToSecondaryAxis } from "../helpers/dualAxis";

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
 * [ComboChart](http://sdk.gooddata.com/gdc-ui-sdk-doc/docs/next/combo_chart_component.html)
 * is a component with bucket props primaryMeasures, secondaryMeasures, viewBy, filters
 */
export function ComboChart(props: IComboChartProps): JSX.Element {
    const clonedProps = cloneDeep(props);
    const { columnMeasures, lineMeasures, viewBy } = clonedProps;
    const isOldConfig = Boolean(columnMeasures || lineMeasures);
    const categories = isArray(viewBy) ? [viewBy[0]] : [viewBy];

    if (isOldConfig) {
        set(clonedProps, "primaryMeasures", columnMeasures);
        set(clonedProps, "secondaryMeasures", lineMeasures);
        set(clonedProps, "config.dualAxis", false);

        // tslint:disable-next-line:no-console
        console.warn(
            "Props columnMeasures and lineMeasures are deprecated. Please migrate to props primaryMeasures and secondaryMeasures.",
        );
    }

    const { primaryMeasures = [], secondaryMeasures = [] } = clonedProps;

    const buckets: VisualizationObject.IBucket[] = [
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

    const newProps = omit<IComboChartProps, IComboChartNonBucketProps>(clonedProps, [
        "columnMeasures",
        "lineMeasures",
        "primaryMeasures",
        "secondaryMeasures",
        "viewBy",
        "filters",
    ]);
    newProps.config = {
        ...setMeasuresToSecondaryAxis(secondaryMeasures, newProps.config),
        mdObject: convertBucketsToMdObject(buckets, props.filters, "local:combo"),
    };

    return (
        <AfmComboChart
            {...newProps}
            projectId={props.projectId}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getResultSpec(buckets, props.sortBy)}
        />
    );
}
