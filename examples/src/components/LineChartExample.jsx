import React, { Component } from 'react';
import { AfmComponents } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';
import { Loading } from './utils/Loading';
import { Error } from './utils/Error';

import {
    projectId,
    monthDateIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty
} from '../utils/fixtures';

const { LineChart } = AfmComponents;

const afm = {
    measures: [
        {
            localIdentifier: 'franchiseFeesIdentifier',
            definition: {
                measure: {
                    item: {
                        identifier: franchiseFeesIdentifier
                    }
                }
            },
            format: '#,##0'
        },
        {
            localIdentifier: 'franchiseFeesAdRoyaltyIdentifier',
            definition: {
                measure: {
                    item: {
                        identifier: franchiseFeesAdRoyaltyIdentifier
                    }
                }
            },
            format: '#,##0'
        },
        {
            localIdentifier: 'franchiseFeesInitialFranchiseFeeIdentifier',
            definition: {
                measure: {
                    item: {
                        identifier: franchiseFeesInitialFranchiseFeeIdentifier
                    }
                }
            },
            format: '#,##0'
        },
        {
            localIdentifier: 'franchiseFeesIdentifierOngoingRoyalty',
            definition: {
                measure: {
                    item: {
                        identifier: franchiseFeesIdentifierOngoingRoyalty
                    }
                }
            },
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

export const CUSTOM_COLORS = [
    'rgba(195, 49, 73, 1)',
    'rgba(168, 194, 86, 1)',
    'rgba(243, 217, 177, 1)',
    'rgba(194, 153, 121, 1)'
];

export class LineChartExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log('LineChartExample onLoadingChanged', ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log('LineChartExample onError', ...params);
    }

    render() {
        return (
            <div style={{ height: 300 }} className="s-line-chart">
                <LineChart
                    projectId={projectId}
                    afm={afm}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                    config={{ colors: CUSTOM_COLORS }}
                    LoadingComponent={Loading}
                    ErrorComponent={Error}
                />
            </div>
        );
    }
}

export default LineChartExample;
