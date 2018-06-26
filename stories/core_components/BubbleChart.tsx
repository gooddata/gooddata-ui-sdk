import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { BubbleChart } from '../../src/index';
import { onErrorHandler } from '../mocks';
import {
    ATTRIBUTE_1,
    MEASURE_1,
    MEASURE_2,
    MEASURE_3,
    ATTRIBUTE_1_SORT_ITEM
} from '../data/componentProps';

const wrapperStyle = { width: 800, height: 400 };

storiesOf('Core components/BubbleChart', module)
    .add('basic render', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <BubbleChart
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    yAxisMeasure={MEASURE_2}
                    size={MEASURE_3}
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
                <BubbleChart
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    yAxisMeasure={MEASURE_2}
                    size={MEASURE_3}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    sortBy={[{
                        attributeSortItem: {
                            ...ATTRIBUTE_1_SORT_ITEM.attributeSortItem,
                            direction: 'desc'
                        }
                    }]}
                />
            </div>
        )
    ))
    .add('without y axis measure', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <BubbleChart
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    size={MEASURE_3}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ));
