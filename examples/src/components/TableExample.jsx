// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { Table, BucketApi } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    monthDateIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty
} from '../utils/fixtures';

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

        const totals = [
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
        ];

        const attributes = [
            BucketApi.visualizationAttribute(monthDateIdentifier).localIdentifier('month')
        ];

        return (
            <div style={{ height: 300 }} className="s-table">
                <Table
                    projectId={projectId}
                    measures={measures}
                    attributes={attributes}
                    totals={totals}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default TableExample;
