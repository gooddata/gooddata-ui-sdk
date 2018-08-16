// (C) 2007-2018 GoodData Corporation

import React, { Component } from 'react';
import { Headline } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    totalSalesIdentifier,
    dateDataSetUri,
    projectId
} from '../utils/fixtures';
import {
    createRelativeDateFilter,
    createMeasureBucketItem,
    createPreviousPeriodMeasureBucketItem
} from '../utils/helpers';

export class PreviousPeriodHeadlineExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log('PreviousPeriodHeadlineExample onLoadingChanged', ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log('PreviousPeriodHeadlineExample onError', ...params);
    }

    render() {
        return (
            <div style={{ height: 125 }} className="s-headline">
                <Headline
                    projectId={projectId}
                    primaryMeasure={createMeasureBucketItem(totalSalesIdentifier, 'totalSales', '$ Total Sales')}
                    secondaryMeasure={createPreviousPeriodMeasureBucketItem('totalSales', dateDataSetUri,
                        '$ Total Sales - previous period')}
                    filters={[createRelativeDateFilter(dateDataSetUri, 'GDC.time.year', -2, -1)]}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default PreviousPeriodHeadlineExample;
