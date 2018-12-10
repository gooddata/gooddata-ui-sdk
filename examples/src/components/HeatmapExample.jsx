// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { Heatmap, BucketApi } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    totalSalesIdentifier,
    menuCategoryAttributeDFIdentifier,
    locationStateDisplayFormIdentifier
} from '../utils/fixtures';

export class HeatmapExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        console.info('HeatmapExample onLoadingChanged', ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        console.info('HeatmapExample onLoadingChanged', ...params);
    }

    render() {
        const totalSales = BucketApi.measure(totalSalesIdentifier).format('#,##0').alias('$ Total Sales');

        const menuCategory = BucketApi.visualizationAttribute(menuCategoryAttributeDFIdentifier);

        const locationState = BucketApi.visualizationAttribute(locationStateDisplayFormIdentifier);

        return (
            <div style={{ height: 300 }} className="s-heat-map">
                <Heatmap
                    projectId={projectId}
                    measure={totalSales}
                    rows={locationState}
                    columns={menuCategory}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default HeatmapExample;
