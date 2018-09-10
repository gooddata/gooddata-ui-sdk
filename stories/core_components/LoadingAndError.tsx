// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { LoadingComponent } from '../../src/components/simple/LoadingComponent';
import { ErrorComponent } from '../../src/components/simple/ErrorComponent';

const wrapperStyle = { height: 300 };

storiesOf('Core components/Loading and Error', module)
    .add('Loading default', () => (
        <div
            style={wrapperStyle}
        >
            <LoadingComponent />
        </div>
    ))
    .add('Loading customised', () => (
        <div
            style={wrapperStyle}
        >
            <LoadingComponent color="tomato" speed={2} imageHeight={16}/>
        </div>
    ))
    .add('Error default', () => (
        <div
            style={wrapperStyle}
        >
            <ErrorComponent
                icon="icon-cloud-rain"
                message="Too many data points to display"
                description="Try applying one or more filters."
            />
        </div>
    ));
