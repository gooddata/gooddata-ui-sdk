
import React, { Component } from 'react';
import { AfmComponents } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import { Loading } from './utils/Loading';
import { Error } from './utils/Error';
import { totalSalesIdentifier, monthDateIdentifier, projectId } from '../utils/fixtures';

const { ColumnChart } = AfmComponents;

export class ColumnChartExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log('ColumnChartExample onLoadingChanged', ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log('ColumnChartExample onError', ...params);
    }

    render() {
        const afm = {
            measures: [
                {
                    localIdentifier: 'totalSales',
                    definition: {
                        measure: {
                            item: {
                                identifier: totalSalesIdentifier
                            }
                        }
                    },
                    alias: '$ Total Sales',
                    format: '#,##0'
                }
            ],
            attributes: [
                {
                    displayForm: {
                        identifier: monthDateIdentifier
                    },
                    localIdentifier: 'month'
                }
            ]
        };

        return (
            <div style={{ height: 300 }} className="s-column-chart">
                <ColumnChart
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

export default ColumnChartExample;
