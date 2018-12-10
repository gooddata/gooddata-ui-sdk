// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { ScatterPlot, BucketApi } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    franchiseFeesIdentifier,
    franchisedSalesIdentifier,
    locationResortIdentifier
} from '../utils/fixtures';

export class ScatterPlotExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        console.log('ScatterPlotExample onLoadingChanged', ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        console.log('ScatterPlotExample onError', ...params);
    }

    render() {
        const xMeasure = BucketApi.measure(franchiseFeesIdentifier).format('#,##0');

        const yMeasure = BucketApi.measure(franchisedSalesIdentifier).format('#,##0');

        const locationResort = BucketApi.visualizationAttribute(locationResortIdentifier);

        return (
            <div style={{ height: 300 }} className="s-scatter-plot">
                <ScatterPlot
                    projectId={projectId}
                    xAxisMeasure={xMeasure}
                    yAxisMeasure={yMeasure}
                    attribute={locationResort}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default ScatterPlotExample;
