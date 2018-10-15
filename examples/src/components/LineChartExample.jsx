// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { LineChart } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    monthDateIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty
} from '../utils/fixtures';

import { CUSTOM_COLOR_PALETTE } from '../utils/colors';

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
        const measures = [
            {
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
            },
            {
                measure: {
                    localIdentifier: 'franchiseFeesAdRoyaltyIdentifier',
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
                    localIdentifier: 'franchiseFeesInitialFranchiseFeeIdentifier',
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: franchiseFeesInitialFranchiseFeeIdentifier
                            }
                        }
                    },
                    format: '#,##0'
                }
            },
            {
                measure: {
                    localIdentifier: 'franchiseFeesIdentifierOngoingRoyalty',
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: franchiseFeesIdentifierOngoingRoyalty
                            }
                        }
                    },
                    format: '#,##0'
                }
            }
        ];

        const attribute = {
            visualizationAttribute: {
                displayForm: {
                    identifier: monthDateIdentifier
                },
                localIdentifier: 'month'
            }
        };

        return (
            <div style={{ height: 300 }} className="s-line-chart">
                <LineChart
                    projectId={projectId}
                    measures={measures}
                    trendBy={attribute}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                    config={{ colorPalette: CUSTOM_COLOR_PALETTE }}
                />
            </div>
        );
    }
}

export default LineChartExample;
