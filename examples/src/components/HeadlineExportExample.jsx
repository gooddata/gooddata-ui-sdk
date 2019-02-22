// (C) 2007-2019 GoodData Corporation
import React, { Component } from 'react';
import { Headline, Model } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import ExampleWithExport from './utils/ExampleWithExport';
import {
    projectId,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier
} from '../utils/fixtures';

export class HeadlineExportExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        console.info('HeadlineExportExample onLoadingChanged', ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        console.info('HeadlineExportExample onError', ...params);
    }

    render() {
        const primaryMeasure = Model.measure(franchiseFeesIdentifier).format('#,##0');

        const secondaryMeasure = Model.measure(franchiseFeesAdRoyaltyIdentifier).format('#,##0');

        return (
            <ExampleWithExport>
                {onExportReady => (
                    <div className="s-headline" style={{ display: 'flex' }}>
                        <Headline
                            projectId={projectId}
                            primaryMeasure={primaryMeasure}
                            secondaryMeasure={secondaryMeasure}
                            onExportReady={onExportReady}
                            onLoadingChanged={this.onLoadingChanged}
                            onError={this.onError}
                        />
                    </div>
                )}
            </ExampleWithExport >
        );
    }
}

export default HeadlineExportExample;
