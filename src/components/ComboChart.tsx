import * as React from 'react';
import { omit } from 'lodash';
import { Subtract } from 'utility-types';
import { VisualizationObject, AFM } from '@gooddata/typings';

import { ComboChart as AfmComboChart } from './afm/ComboChart';
import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM, convertBucketsToMdObject } from '../helpers/conversion';

export interface IComboChartBucketProps {
    columnMeasures: VisualizationObject.IMeasure[];
    lineMeasures?: VisualizationObject.IMeasure[];
    viewBy?: VisualizationObject.IVisualizationAttribute;
    filters?: VisualizationObject.VisualizationObjectFilter[];
}

export interface IComboChartProps extends ICommonChartProps, IComboChartBucketProps {
    projectId: string;
}

type IComboChartNonBucketProps = Subtract<IComboChartProps, IComboChartBucketProps>;

function generateDefaultDimensions(afm: AFM.IAfm): AFM.IDimension[] {
    return [
        {
            itemIdentifiers: ['measureGroup']
        },
        {
            itemIdentifiers: (afm.attributes || []).map(a => a.localIdentifier)
        }
    ];
}

function getResultSpec(buckets: VisualizationObject.IBucket[]): AFM.IResultSpec {
    return {
        dimensions: generateDefaultDimensions(convertBucketsToAFM(buckets))
    };
}

/**
 * [ComboChart](http://sdk.gooddata.com/gdc-ui-sdk-doc/docs/next/combo_chart_component.html)
 * is a component with bucket props primaryMeasures, secondaryMeasures, viewBy, filters
 */
export function ComboChart(props: IComboChartProps): JSX.Element {
    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: 'measures',
            items: props.columnMeasures || []
        },
        {
            localIdentifier: 'secondary_measures',
            items: props.lineMeasures || []
        },
        {
            localIdentifier: 'view',
            items: props.viewBy ? [props.viewBy] : []
        }
    ];

    const newProps
        = omit<IComboChartProps, IComboChartNonBucketProps>(
            props, ['columnMeasures', 'lineMeasures', 'viewBy', 'filters']
        );
    newProps.config = {
        ...newProps.config,
        mdObject: convertBucketsToMdObject(buckets, props.filters, 'local:combo')
    };

    return (
        <AfmComboChart
            {...newProps}
            projectId={props.projectId}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getResultSpec(buckets)}
        />
    );
}
