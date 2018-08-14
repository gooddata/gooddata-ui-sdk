// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { Headline } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier
} from '../utils/fixtures';

export class HeadlineExample extends Component {
    onLoadingChanged(...params) {
    // eslint-disable-next-line no-console
        return console.log('ColumnChartExample onLoadingChanged', ...params);
    }

    onError(...params) {
    // eslint-disable-next-line no-console
        return console.log('ColumnChartExample onError', ...params);
    }

    render() {
        const primaryMeasure = {
            measure: {
                localIdentifier: 'franchiseFeesIdentifier',
                definition: {
                    measureDefinition: {
                        item: {
                            identifier: franchiseFeesIdentifier
                        }
                    }
                },
                format: '#,##0'
            }
        };
        const secondaryMeasure = {
            measure: {
                localIdentifier: 'franchiseFeesAdRoyaltyIdentifier',
                definition: {
                    measureDefinition: {
                        item: {
                            identifier: franchiseFeesAdRoyaltyIdentifier
                        }
                    }
                },
                format: '#,##0'
            }
        };

        return (
            <div className="s-headline" style={{ display: 'flex' }}>
                <style jsx>
                    {`
                        .column {
                            flex: '1 1 50%'
                        }
                    `}
                </style>
                <div className="column">
                    <Headline
                        projectId={projectId}
                        primaryMeasure={primaryMeasure}
                        onLoadingChanged={this.onLoadingChanged}
                        onError={this.onError}
                    />
                </div>
                <div className="column">
                    <Headline
                        projectId={projectId}
                        primaryMeasure={primaryMeasure}
                        secondaryMeasure={secondaryMeasure}
                        onLoadingChanged={this.onLoadingChanged}
                        onError={this.onError}
                    />
                </div>
            </div>
        );
    }
}

export default HeadlineExample;
