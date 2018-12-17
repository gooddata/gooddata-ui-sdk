// (C) 2007-2018 GoodData Corporation

import React, { Component } from 'react';
import { Table } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    monthDateIdentifier,
    monthDateDataSetAttributeIdentifier,
    totalSalesIdentifier
} from '../utils/fixtures';
import {
    createMeasureBucketItem,
    createSamePeriodMeasureBucketItem
} from '../utils/helpers';

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
        const totalSalesYearAgoBucketItem = createSamePeriodMeasureBucketItem(
            'totalSales', monthDateDataSetAttributeIdentifier, '$ Total Sales - year ago'
        );
        const totalSalesBucketItem = createMeasureBucketItem(
            totalSalesIdentifier, 'totalSales', '$ Total Sales'
        );
        const measures = [
            totalSalesYearAgoBucketItem,
            totalSalesBucketItem,
            {
                measure: {
                    localIdentifier: 'totalSalesChange',
                    title: '% Total Sales Change',
                    definition: {
                        arithmeticMeasure: {
                            measureIdentifiers: [
                                totalSalesBucketItem.measure.localIdentifier,
                                totalSalesYearAgoBucketItem.measure.localIdentifier
                            ],
                            operator: 'change'
                        }
                    },
                    format: '#,##0%'
                }
            }
        ];

        const attributes = [
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
