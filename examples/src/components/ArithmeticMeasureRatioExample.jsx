// (C) 2007-2018 GoodData Corporation

import React, { Component } from 'react';
import { Table, BucketApi } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    locationStateDisplayFormIdentifier,
    numberOfRestaurantsIdentifier,
    totalSalesIdentifier
} from '../utils/fixtures';

export class ArithmeticMeasureRatioExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log('ArithmeticMeasureRatioExample onLoadingChanged', ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log('ArithmeticMeasureRatioExample onError', ...params);
    }

    render() {
        const localIdentifiers = {
            numberOfRestaurants: 'numberOfRestaurants',
            averageRestaurantDailyCosts: 'averageRestaurantDailyCosts',
            averageRestaurantSales: 'averageRestaurantSales'
        };

        const measures = [
            BucketApi.measure(numberOfRestaurantsIdentifier)
                .localIdentifier(localIdentifiers.numberOfRestaurants)
                .format('#,##0'),
            BucketApi.measure(totalSalesIdentifier)
                .localIdentifier(localIdentifiers.averageRestaurantDailyCosts)
                .format('#,##0'),
            BucketApi.arithmeticMeasure([
                localIdentifiers.numberOfRestaurants,
                localIdentifiers.averageRestaurantDailyCosts
            ], 'ratio')
                .localIdentifier(localIdentifiers.averageRestaurantSales)
                .format('#,##0')
                .title('$ Avg State Daily Sales')
        ];

        const attributes = [
            BucketApi.visualizationAttribute(locationStateDisplayFormIdentifier).localIdentifier('month')
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

export default ArithmeticMeasureRatioExample;
