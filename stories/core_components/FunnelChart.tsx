import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { FunnelChart } from '../../src/index';
import { onErrorHandler } from '../mocks';
import {
    ATTRIBUTE_1,
    MEASURE_1,
    ATTRIBUTE_1_SORT_ITEM
} from '../data/componentProps';

const wrapperStyle = { width: 800, height: 400 };

storiesOf('Core components/FunnelChart', module)
    .add('basic render', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <FunnelChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('sort by attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <FunnelChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    sortBy={[{
                        ...ATTRIBUTE_1_SORT_ITEM,
                        direction: 'desc'
                    }]}
                />
            </div>
        )
    ));
