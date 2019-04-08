// (C) 2007-2019 GoodData Corporation
import * as React from 'react';
import omit = require('lodash/omit');
import { Subtract } from 'utility-types';
import { VisualizationObject, VisualizationInput } from '@gooddata/typings';

import { ComboChart as AfmComboChart } from './afm/ComboChart';
import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM, convertBucketsToMdObject } from '../helpers/conversion';
import { getResultSpec } from '../helpers/resultSpec';
import { MEASURES, SECONDARY_MEASURES, VIEW } from '../constants/bucketNames';
import { setMeasuresToSecondaryAxis } from '../helpers/dualAxis';

export interface IComboChartBucketProps {
    primaryMeasures: VisualizationInput.IMeasure[];
    secondaryMeasures: VisualizationInput.IMeasure[];
    viewBy?: VisualizationInput.IAttribute;
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
    const primaryMeasures = props.primaryMeasures || [];
    const secondaryMeasures = props.secondaryMeasures || [];

    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: primaryMeasures
        },
        {
            localIdentifier: SECONDARY_MEASURES,
            items: secondaryMeasures
        },
        {
            localIdentifier: VIEW,
            items: props.viewBy ? [props.viewBy] : []
        }
    ];

    const newProps
        = omit<IComboChartProps, IComboChartNonBucketProps>(
            props, ['primaryMeasures', 'secondaryMeasures', 'viewBy', 'filters']
        );
    newProps.config = {
        ...setMeasuresToSecondaryAxis(secondaryMeasures, newProps.config),
        mdObject: convertBucketsToMdObject(buckets, props.filters, 'local:combo')
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
