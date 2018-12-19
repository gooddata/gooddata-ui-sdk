// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { PivotTable, BucketApi } from '@gooddata/react-components';

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
            BucketApi.measure(franchiseFeesIdentifier)
                .format('#,##0'),
            BucketApi.measure(franchiseFeesAdRoyaltyIdentifier)
                .format('#,##0'),
            BucketApi.measure(franchiseFeesInitialFranchiseFeeIdentifier)
                .format('#,##0'),
            BucketApi.measure(franchiseFeesIdentifierOngoingRoyalty)
                .format('#,##0')
        ];

        const attributes = [
            BucketApi.visualizationAttribute(locationStateDisplayFormIdentifier),
            BucketApi.visualizationAttribute(locationNameDisplayFormIdentifier),
            BucketApi.visualizationAttribute(menuCategoryAttributeDFIdentifier).localIdentifier('menu')
        ];

        const columns = [
            BucketApi.visualizationAttribute(quarterDateIdentifier),
            BucketApi.visualizationAttribute(monthDateIdentifier)
        ];

        const sortBy = [
            BucketApi.attributeSortItem('menu', 'asc')
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
