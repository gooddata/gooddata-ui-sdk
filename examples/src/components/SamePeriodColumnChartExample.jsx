// (C) 2007-2018 GoodData Corporation

import React, { Component } from 'react';
import { ColumnChart, BucketApi } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    totalSalesIdentifier,
    quarterDateIdentifier,
    yearDateDataSetAttributeIdentifier,
    projectId
} from '../utils/fixtures';

export class SamePeriodColumnChartExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log('SamePeriodColumnChartExample onLoadingChanged', ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log('SamePeriodColumnChartExample onError', ...params);
    }

    render() {
        return (
            <div style={{ height: 300 }} className="s-column-chart">
                <ColumnChart
                    projectId={projectId}
                    measures={[
                        BucketApi.popMeasure('totalSales', yearDateDataSetAttributeIdentifier)
                            .alias('$ Total Sales - SP year ago'),
                        BucketApi.measure(totalSalesIdentifier)
                            .localIdentifier('totalSales')
                            .alias('$ Total Sales')
                    ]}
                    viewBy={BucketApi.visualizationAttribute(quarterDateIdentifier)}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default SamePeriodColumnChartExample;
