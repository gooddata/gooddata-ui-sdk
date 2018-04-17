// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { omit } from 'lodash';
import { Subtract } from 'utility-types';
import { VisualizationObject } from '@gooddata/typings';

import { Treemap as AfmTreemap } from './afm/Treemap';
import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM } from '../helpers/conversion';

export interface ITreemapBucketProps {
    measures: VisualizationObject.BucketItem[];
    viewBy?: VisualizationObject.IVisualizationAttribute;
    filters?: VisualizationObject.VisualizationObjectFilter[];
}

export interface ITreemapProps extends ICommonChartProps, ITreemapBucketProps {
    projectId: string;
}

type ITreemapNonBucketProps = Subtract<ITreemapProps, ITreemapBucketProps>;

/**
 * [Treemap](http://sdk.gooddata.com/gdc-ui-sdk-doc/docs/treemap_component.html)
 * is a component with bucket props measures, viewBy, filters
 */
export function Treemap(props: ITreemapProps): JSX.Element {
    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: 'measures',
            items: props.measures || []
        },
        {
            localIdentifier: 'view',
            items: props.viewBy ? [props.viewBy] : []
        }
    ];

    const newProps = omit<ITreemapProps, ITreemapNonBucketProps>(
        props, ['measures', 'viewBy', 'filters']
    );

    return (
        <AfmTreemap
            {...newProps}
            projectId={props.projectId}
            afm={convertBucketsToAFM(buckets, props.filters)}
        />
    );
}
