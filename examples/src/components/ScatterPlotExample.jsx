// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { ScatterPlot } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    franchiseFeesIdentifier,
    franchisedSalesIdentifier,
    locationResortIdentifier
} from '../utils/fixtures';

export const CUSTOM_COLORS = [
    'rgba(195, 49, 73, 1)',
    'rgba(168, 194, 86, 1)',
    'rgba(243, 217, 177, 1)',
    'rgba(194, 153, 121, 1)'
];

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
        const xMeasure = {
            measure: {
                localIdentifier: 'franchiseFeesIdentifier',
                definition: {
                    measureDefinition: {
                        item: {
                            identifier: franchiseFeesIdentifier
                        }
                    }
                },
                format: '#,##0'
            }
        };

        const yMeasure = {
            measure: {
                localIdentifier: 'franchisedSalesIdentifier',
                definition: {
                    measureDefinition: {
                        item: {
                            identifier: franchisedSalesIdentifier
                        }
                    }
                },
                format: '#,##0'
            }
        };

        const locationResort = {
            visualizationAttribute: {
                displayForm: {
                    identifier: locationResortIdentifier
                },
                localIdentifier: 'location_resort'
            }
        };

        return (
            <div style={{ height: 300 }} className="s-scatter-plot">
                <ScatterPlot
                    projectId={projectId}
                    xAxisMeasure={xMeasure}
                    yAxisMeasure={yMeasure}
                    attribute={locationResort}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                    config={{ colors: CUSTOM_COLORS }}
                />
            </div>
        );
    }
}

export default ScatterPlotExample;
