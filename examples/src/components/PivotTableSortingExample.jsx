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

export class PivotTableSortingExample extends Component {
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

        const sortBy = [
            {
                attributeSortItem: {
                    direction: 'asc',
                    attributeIdentifier: 'menu'
                }
            }
        ];

        return (
            <div style={{ height: 300 }} className="s-pivot-table-sorting">
                <PivotTable
                    projectId={projectId}
                    measures={measures}
                    rows={attributes}
                    columns={columns}
                    pageSize={20}
                    sortBy={sortBy}
                />
            </div>
        );
    }
}

export default PivotTableSortingExample;
