import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { FunnelChart } from '../../src/components/afm/FunnelChart';
import { onErrorHandler } from '../mocks';
import {
    AFM_ONE_MEASURE_ONE_ATTRIBUTE
} from '../data/afmComponentProps';

const wrapperStyle = { width: 800, height: 400 };

storiesOf('AFM components/FunnelChart', module)
    .add('basic render', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <FunnelChart
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_ONE_ATTRIBUTE}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ));
