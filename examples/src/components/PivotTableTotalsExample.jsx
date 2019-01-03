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

export class PivotTableTotalsExample extends Component {
    render() {
        const measures = [
            BucketApi.measure(franchiseFeesIdentifier)
                .format('#,##0')
                .localIdentifier('franchiseFeesIdentifier'),
            BucketApi.measure(franchiseFeesAdRoyaltyIdentifier)
                .format('#,##0')
                .localIdentifier('franchiseFeesAdRoyaltyIdentifier'),
            BucketApi.measure(franchiseFeesInitialFranchiseFeeIdentifier)
                .format('#,##0')
                .localIdentifier('franchiseFeesInitialFranchiseFeeIdentifier'),
            BucketApi.measure(franchiseFeesIdentifierOngoingRoyalty)
                .format('#,##0')
                .localIdentifier('franchiseFeesIdentifierOngoingRoyalty')
        ];

        const attributes = [
            BucketApi.attribute(locationStateDisplayFormIdentifier).localIdentifier('state'),
            BucketApi.attribute(locationNameDisplayFormIdentifier),
            BucketApi.attribute(menuCategoryAttributeDFIdentifier)
        ];

        const columns = [
            BucketApi.attribute(quarterDateIdentifier),
            BucketApi.attribute(monthDateIdentifier)
        ];

        const totals = [
            {
                measureIdentifier: 'franchiseFeesIdentifier',
                type: 'sum',
                attributeIdentifier: 'state'
            },
            {
                measureIdentifier: 'franchiseFeesIdentifier',
                type: 'avg',
                attributeIdentifier: 'state'
            },
            {
                measureIdentifier: 'franchiseFeesAdRoyaltyIdentifier',
                type: 'sum',
                attributeIdentifier: 'state'
            },
            {
                measureIdentifier: 'franchiseFeesIdentifier',
                type: 'max',
                attributeIdentifier: 'state'
            }
        ];

        return (
            <div style={{ height: 300 }} className="s-pivot-table-totals">
                <PivotTable
                    projectId={projectId}
                    measures={measures}
                    rows={attributes}
                    columns={columns}
                    pageSize={20}
                    totals={totals}
                />
            </div>
        );
    }
}

export default PivotTableTotalsExample;
