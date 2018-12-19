// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { DonutChart, BucketApi } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty
} from '../utils/fixtures';


export class DonutChartExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log('DonutChartExample onLoadingChanged', ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log('DonutChartExample onError', ...params);
    }

    render() {
        const measures = [
            BucketApi.measure(franchiseFeesAdRoyaltyIdentifier)
                .format('#,##0'),
            BucketApi.measure(franchiseFeesInitialFranchiseFeeIdentifier)
                .format('#,##0'),
            BucketApi.measure(franchiseFeesIdentifierOngoingRoyalty)
                .format('#,##0')
        ];

        return (
            <div style={{ height: 300 }} className="s-donut-chart">
                <DonutChart
                    projectId={projectId}
                    measures={measures}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default DonutChartExample;
