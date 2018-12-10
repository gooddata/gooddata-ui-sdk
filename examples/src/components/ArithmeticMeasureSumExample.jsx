// (C) 2007-2018 GoodData Corporation

import React, { Component } from 'react';
import { Table } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
    locationStateDisplayFormIdentifier
} from '../utils/fixtures';

export class ArithmeticMeasureSumExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log('ArithmeticMeasureSumExample onLoadingChanged', ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log('ArithmeticMeasureSumExample onError', ...params);
    }

    render() {
        const localIdentifiers = {
            franchiseFeesAdRoyalty: 'franchiseFeesAdRoyalty',
            franchiseFeesOngoingRoyalty: 'franchiseFeesOngoingRoyalty'
        };

        const measures = [
            {
                measure: {
                    localIdentifier: localIdentifiers.franchiseFeesAdRoyalty,
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: franchiseFeesAdRoyaltyIdentifier
                            }
                        }
                    },
                    format: '#,##0'
                }
            },
            {
                measure: {
                    localIdentifier: localIdentifiers.franchiseFeesOngoingRoyalty,
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: franchiseFeesIdentifierOngoingRoyalty
                            }
                        }
                    },
                    format: '#,##0'
                }
            },
            {
                measure: {
                    localIdentifier: 'franchiseFeesSum',
                    title: '$ Ongoing / Ad Royalty Sum',
                    definition: {
                        arithmeticMeasure: {
                            measureIdentifiers: [
                                localIdentifiers.franchiseFeesOngoingRoyalty,
                                localIdentifiers.franchiseFeesAdRoyalty
                            ],
                            operator: 'sum'
                        }
                    },
                    format: '#,##0'
                }
            },
            {
                measure: {
                    localIdentifier: 'franchiseFeesDifference',
                    title: '$ Ongoing / Ad Royalty Difference',
                    definition: {
                        arithmeticMeasure: {
                            measureIdentifiers: [
                                localIdentifiers.franchiseFeesOngoingRoyalty,
                                localIdentifiers.franchiseFeesAdRoyalty
                            ],
                            operator: 'difference'
                        }
                    },
                    format: '#,##0'
                }
            }
        ];

        const attributes = [
            {
                visualizationAttribute: {
                    displayForm: {
                        identifier: locationStateDisplayFormIdentifier
                    },
                    localIdentifier: 'month'
                }
            }
        ];

        return (
            <div style={{ height: 200 }} className="s-table">
                <Table
                    projectId={projectId}
                    measures={measures}
                    attributes={attributes}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default ArithmeticMeasureSumExample;
