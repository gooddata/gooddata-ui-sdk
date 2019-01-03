// (C) 2007-2018 GoodData Corporation

import React, { Component } from 'react';
import { Table, BucketApi } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    monthDateIdentifier,
    monthDateDataSetAttributeIdentifier,
    totalSalesIdentifier
} from '../utils/fixtures';

export class ArithmeticMeasureChangeExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log('ArithmeticMeasureChangeExample onLoadingChanged', ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log('ArithmeticMeasureChangeExample onError', ...params);
    }

    render() {
        const totalSalesYearAgoBucketItem = BucketApi.previousPeriodMeasure(
            'totalSales', [{ dataSet: monthDateDataSetAttributeIdentifier, periodsAgo: 1 }]
        ).alias('$ Total Sales - year ago').localIdentifier('totalSales_sp');

        const totalSalesBucketItem = BucketApi.measure(totalSalesIdentifier)
            .localIdentifier('totalSales')
            .alias('$ Total Sales');

        const measures = [
            totalSalesYearAgoBucketItem,
            totalSalesBucketItem,
            BucketApi.arithmeticMeasure([
                totalSalesBucketItem.measure.localIdentifier,
                totalSalesYearAgoBucketItem.measure.localIdentifier
            ], 'change')
                .format('#,##0%')
                .title('% Total Sales Change')
                .localIdentifier('totalSalesChange')
        ];

        const attributes = [
            BucketApi.attribute(monthDateIdentifier).localIdentifier('month')
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

export default ArithmeticMeasureChangeExample;
