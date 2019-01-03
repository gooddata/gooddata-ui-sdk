// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { ComboChart, BucketApi } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    locationResortIdentifier
} from '../utils/fixtures';


export class ComboChartExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log('ComboChartExample onLoadingChanged', ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log('ComboChartExample onError', ...params);
    }

    render() {
        const columnMeasures = [
            BucketApi.measure(franchiseFeesAdRoyaltyIdentifier)
                .format('#,##0')
                .localIdentifier('franchiseFeesAdRoyaltyIdentifier')
        ];

        const lineMeasures = [
            BucketApi.measure(franchiseFeesInitialFranchiseFeeIdentifier)
                .format('#,##0')
                .localIdentifier('franchiseFeesInitialFranchiseFeeIdentifier')
        ];

        const locationResort = BucketApi.attribute(locationResortIdentifier)
            .localIdentifier('location_resort');

        return (
            <div style={{ height: 300 }} className="s-combo-chart">
                <ComboChart
                    projectId={projectId}
                    columnMeasures={columnMeasures}
                    lineMeasures={lineMeasures}
                    viewBy={locationResort}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default ComboChartExample;
