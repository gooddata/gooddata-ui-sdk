// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { Heatmap } from '@gooddata/react-components';

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
        const totalSales = {
            measure: {
                localIdentifier: 'totalSales',
                definition: {
                    measureDefinition: {
                        item: {
                            identifier: totalSalesIdentifier
                        }
                    }
                },
                alias: '$ Total Sales',
                format: '#,##0'
            }
        };

        const menuCategory = {
            visualizationAttribute: {
                displayForm: {
                    identifier: menuCategoryAttributeDFIdentifier
                },
                localIdentifier: 'menu'
            }
        };

        const locationState = {
            visualizationAttribute: {
                displayForm: {
                    identifier: locationStateDisplayFormIdentifier
                },
                localIdentifier: 'state'
            }
        };

        return (
            <div style={{ height: 300 }} className="s-heat-map">
                <Heatmap
                    projectId={projectId}
                    measure={totalSales}
                    trendBy={locationState}
                    segmentBy={menuCategory}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default HeatmapExample;
