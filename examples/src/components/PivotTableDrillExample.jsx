// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { PivotTable } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    quarterDateIdentifier,
    monthDateIdentifier,
    locationStateDisplayFormIdentifier,
    locationNameDisplayFormIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
    menuCategoryAttributeDFIdentifier
} from '../utils/fixtures';

export class PivotTableDrillExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
            drillEvent: null
        };
    }

    onDrill = (drillEvent) => {
        // eslint-disable-next-line no-console
        console.log('onFiredDrillEvent', drillEvent, JSON.stringify(drillEvent.drillContext.intersection, null, 2));
        this.setState({
            drillEvent
        });
        return true;
    }

    render() {
        const { drillEvent } = this.state;

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

        const drillableItems = [{
            identifier: menuCategoryAttributeDFIdentifier
        }];

        const attributes = [
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
            },
            {
                visualizationAttribute: {
                    displayForm: {
                        identifier: menuCategoryAttributeDFIdentifier
                    },
                    localIdentifier: 'menu'
                }
            }
        ];

        const columns = [
            {
                visualizationAttribute: {
                    displayForm: {
                        identifier: quarterDateIdentifier
                    },
                    localIdentifier: 'quarter'
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
        ];

        return (
            <div>
                {drillEvent === null ? null : <h3>You have Clicked <span className="s-drill-value">{drillEvent.drillContext.value}</span> </h3>}
                <div style={{ height: 300 }} className="s-pivot-table-drill">
                    <PivotTable
                        projectId={projectId}
                        measures={measures}
                        rows={attributes}
                        columns={columns}
                        pageSize={20}
                        drillableItems={drillableItems}
                        onFiredDrillEvent={this.onDrill}
                    />
                </div>
            </div>
        );
    }
}

export default PivotTableDrillExample;
