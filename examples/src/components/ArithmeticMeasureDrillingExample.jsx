// (C) 2007-2018 GoodData Corporation

import React, { Component } from 'react';
import { Table, HeaderPredicateFactory } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    locationStateDisplayFormIdentifier,
    numberOfRestaurantsIdentifier,
    totalSalesIdentifier
} from '../utils/fixtures';

export class ArithmeticMeasureDrillingExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
            drillEvent: null
        };
    }

    onDrill = (drillEvent) => {
        // eslint-disable-next-line no-console
        console.log('onFiredDrillEvent', drillEvent, JSON.stringify(drillEvent.drillContext.intersection, null, 2));
        this.setState({
            drillEvent
        });
        return true;
    };

    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log('ArithmeticMeasureDrillingExample onLoadingChanged', ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log('ArithmeticMeasureDrillingExample onError', ...params);
    }

    render() {
        const { drillEvent } = this.state;

        const localIdentifiers = {
            numberOfRestaurants: 'numberOfRestaurants',
            totalSales: 'totalSales',
            averageRestaurantSales: 'averageRestaurantSales'
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
                    localIdentifier: localIdentifiers.totalSales,
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: totalSalesIdentifier
                            }
                        }
                    },
                    format: '#,##0'
                }
            },
            {
                measure: {
                    localIdentifier: 'averageRestaurantSales',
                    title: '$ Avg Restaurant Sales',
                    definition: {
                        arithmeticMeasure: {
                            measureIdentifiers: [
                                localIdentifiers.totalSales,
                                localIdentifiers.numberOfRestaurants
                            ],
                            operator: 'ratio'
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

        const drillNotificationComponent = () => {
            const averageSales = drillEvent.drillContext.row[drillEvent.drillContext.columnIndex];
            return (
                <h3>You have clicked <span className="s-drill-value">{averageSales}</span></h3>
            );
        };

        return (
            <div>
                {drillEvent === null ? null : drillNotificationComponent()}
                <div style={{ height: 200 }} className="s-table">
                    <Table
                        projectId={projectId}
                        measures={measures}
                        attributes={attributes}
                        onLoadingChanged={this.onLoadingChanged}
                        onError={this.onError}
                        drillableItems={[
                            HeaderPredicateFactory.composedFromIdentifier(totalSalesIdentifier)
                        ]}
                        onFiredDrillEvent={this.onDrill}
                    />
                </div>
            </div>
        );
    }
}

export default ArithmeticMeasureDrillingExample;
