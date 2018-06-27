// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { AGTable } from '@gooddata/react-components';
import PropTypes from 'prop-types';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    yearDateIdentifier,
    monthDateIdentifier,
    locationStateDisplayFormIdentifier,
    locationNameDisplayFormIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty
} from '../utils/fixtures';

export class AGTableExample extends Component {
    static propTypes = {
        withMeasures: PropTypes.bool,
        withAttributes: PropTypes.bool,
        withPivot: PropTypes.bool
    }

    static defaultProps = {
        withMeasures: false,
        withAttributes: false,
        withPivot: false
    }

    render() {
        const { withMeasures, withAttributes, withPivot } = this.props;
        const measures = withMeasures ? [
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
        ] : [];

        // const totals = [
        //     {
        //         measureIdentifier: 'franchiseFeesIdentifier',
        //         type: 'avg',
        //         attributeIdentifier: 'month'
        //     },
        //     {
        //         measureIdentifier: 'franchiseFeesAdRoyaltyIdentifier',
        //         type: 'avg',
        //         attributeIdentifier: 'month'
        //     },
        //     {
        //         measureIdentifier: 'franchiseFeesInitialFranchiseFeeIdentifier',
        //         type: 'avg',
        //         attributeIdentifier: 'month'
        //     },
        //     {
        //         measureIdentifier: 'franchiseFeesIdentifierOngoingRoyalty',
        //         type: 'avg',
        //         attributeIdentifier: 'month'
        //     }
        // ];

        const attributes = withAttributes ? [
            {
                visualizationAttribute: {
                    displayForm: {
                        identifier: locationStateDisplayFormIdentifier
                    },
                    localIdentifier: 'state'
                }
            },
            {
                visualizationAttribute: {
                    displayForm: {
                        identifier: locationNameDisplayFormIdentifier
                    },
                    localIdentifier: 'location'
                }
            }
        ] : [];

        const columns = withPivot ? [
            {
                visualizationAttribute: {
                    displayForm: {
                        identifier: yearDateIdentifier
                    },
                    localIdentifier: 'year'
                }
            },
            {
                visualizationAttribute: {
                    displayForm: {
                        identifier: monthDateIdentifier
                    },
                    localIdentifier: 'month'
                }
            }
        ] : [];

        return (
            <div style={{ height: 300 }} className="s-table ag-theme-balham">
                <AGTable
                    projectId={projectId}
                    measures={measures}
                    attributes={attributes}
                    columns={columns}
                    // totals={totals}
                    // onLoadingChanged={this.onLoadingChanged}
                    // onError={this.onError}
                />
            </div>
        );
    }
}

export default AGTableExample;
