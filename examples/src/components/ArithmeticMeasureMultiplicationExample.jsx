// (C) 2007-2018 GoodData Corporation

import React, { Component } from 'react';
import { Table } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    locationStateDisplayFormIdentifier,
    numberOfRestaurantsIdentifier,
    averageRestaurantDailyCostsIdentifier
} from '../utils/fixtures';

export class ArithmeticMeasureMultiplicationExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log('ArithmeticMeasureMultiplicationExample onLoadingChanged', ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log('ArithmeticMeasureMultiplicationExample onError', ...params);
    }

    render() {
        const localIdentifiers = {
            numberOfRestaurants: 'numberOfRestaurants',
            averageRestaurantDailyCosts: 'averageRestaurantDailyCosts'
        };

        const measures = [
            {
                measure: {
                    localIdentifier: localIdentifiers.numberOfRestaurants,
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: numberOfRestaurantsIdentifier
                            }
                        }
                    },
                    format: '#,##0'
                }
            },
            {
                measure: {
                    localIdentifier: localIdentifiers.averageRestaurantDailyCosts,
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: averageRestaurantDailyCostsIdentifier
                            }
                        }
                    },
                    format: '#,##0'
                }
            },
            {
                measure: {
                    localIdentifier: 'averageStateDailyCosts',
                    title: '$ Avg State Daily Costs',
                    definition: {
                        arithmeticMeasure: {
                            measureIdentifiers: [
                                localIdentifiers.numberOfRestaurants,
                                localIdentifiers.averageRestaurantDailyCosts
                            ],
                            operator: 'multiplication'
                        }
                    },
                    format: '#,##0'
                }
            }
        ];

        const attributes = [
            {
                visualizationAttribute: {
                    displayForm: {
                        identifier: locationStateDisplayFormIdentifier
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

export default ArithmeticMeasureMultiplicationExample;
