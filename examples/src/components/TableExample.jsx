import React, { Component } from 'react';
import { AfmComponents } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    monthDateIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty
} from '../utils/fixtures';
import { Loading } from './utils/Loading';
import { Error } from './utils/Error';

export class TableExample extends Component {
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

        const resultSpec = {
            dimensions: [
                {
                    itemIdentifiers: ['month'],
                    totals: [
                        {
                            measureIdentifier: 'franchiseFeesIdentifier',
                            type: 'avg',
                            attributeIdentifier: 'month'
                        },
                        {
                            measureIdentifier: 'franchiseFeesAdRoyaltyIdentifier',
                            type: 'avg',
                            attributeIdentifier: 'month'
                        },
                        {
                            measureIdentifier: 'franchiseFeesInitialFranchiseFeeIdentifier',
                            type: 'avg',
                            attributeIdentifier: 'month'
                        },
                        {
                            measureIdentifier: 'franchiseFeesIdentifierOngoingRoyalty',
                            type: 'avg',
                            attributeIdentifier: 'month'
                        }
                    ]
                },
                {
                    itemIdentifiers: ['measureGroup']
                }
            ]
        };

        return (
            <div style={{ height: 300 }} className="s-table">
                <AfmComponents.Table
                    projectId={projectId}
                    afm={afm}
                    resultSpec={resultSpec}
                    totals={[
                        { type: 'avg', outputMeasureIndexes: [0, 1, 2, 3], alias: 'AVG' }
                    ]}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                    LoadingComponent={Loading}
                    ErrorComponent={Error}
                />
            </div>
        );
    }
}

export default TableExample;
