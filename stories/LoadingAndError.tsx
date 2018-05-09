import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { LoadingComponent } from '../src/components/simple/LoadingComponent';
import { ErrorComponent } from '../src/components/simple/ErrorComponent';

storiesOf('Core components/Loading and Error', module)
    .add('Loading default', () => (
        <div
            style={{
                height: 300
            }}
        >
            <LoadingComponent />
        </div>
    ))
    .add('Loading customised', () => (
        <div
            style={{
                height: 300
            }}
        >
            <LoadingComponent color="tomato" speed={2} imageHeight={16}/>
        </div>
    ))
    .add('Error default', () => (
        <div
            style={{
                height: 300
            }}
        >
            <ErrorComponent
                icon="icon-cloud-rain"
                message="Too many data points to display"
                description="Try applying one or more filters."
            />
        </div>
    ));
