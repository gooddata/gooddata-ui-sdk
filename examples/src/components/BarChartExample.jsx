import React, { Component } from 'react';
import { AfmComponents } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import { Loading } from './Loading';
import { Error } from './Error';
import { totalSalesIdentifier, locationResortIdentifier, projectId } from '../utils/fixtures';

const { BarChart } = AfmComponents;

export class BarChartExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        console.info('BarChartExample onLoadingChanged', ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        console.info('BarChartExample onLoadingChanged', ...params);
    }

    render() {
        const afm = {
            measures: [
                {
                    localIdentifier: 'amount',
                    definition: {
                        measure: {
                            item: {
                                identifier: totalSalesIdentifier
                            },
                            aggregation: 'sum'
                        }
                    },
                    alias: '$ Total Sales',
                    format: '#,##0'
                }
            ],
            attributes: [
                {
                    displayForm: {
                        identifier: locationResortIdentifier
                    },
                    localIdentifier: 'location_resort'
                }
            ]
        };

        return (
            <div style={{ height: 300 }} >
                <BarChart
                    projectId={projectId}
                    afm={afm}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                    LoadingComponent={Loading}
                    ErrorComponent={Error}
                />
            </div>
        );
    }
}

export default BarChartExample;
