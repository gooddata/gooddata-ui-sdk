// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { AreaChart } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    monthDateIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty
} from '../utils/fixtures';

export class AreaChartExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log('AreaChartExample onLoadingChanged', ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log('AreaChartExample onError', ...params);
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

        const viewBy = {
            visualizationAttribute: {
                displayForm: {
                    identifier: monthDateIdentifier
                },
                localIdentifier: 'month'
            }
        };

        return (
            <div style={{ height: 300 }} className="s-area-chart">
                <AreaChart
                    projectId={projectId}
                    measures={measures}
                    viewBy={viewBy}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                    config={{
                        stacking: false
                    }}
                />
            </div>
        );
    }
}

export default AreaChartExample;
