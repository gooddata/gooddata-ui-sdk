import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { ScatterPlot } from '../../src/index';
import { onErrorHandler } from '../mocks';
import {
    ATTRIBUTE_1,
    MEASURE_1,
    MEASURE_2,
    ATTRIBUTE_1_SORT_ITEM,
    MEASURE_WITH_FORMAT
} from '../data/componentProps';

const wrapperStyle = { width: 800, height: 400 };

storiesOf('Core components/ScatterPlot', module)
    .add('basic render', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <ScatterPlot
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    yAxisMeasure={MEASURE_2}
                    attribute={ATTRIBUTE_1}
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
                <ScatterPlot
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    yAxisMeasure={MEASURE_2}
                    attribute={ATTRIBUTE_1}
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
    .add('only secondary measure - tooltip shows y-value', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <ScatterPlot
                    projectId="storybook"
                    yAxisMeasure={MEASURE_2}
                    attribute={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    )).add('% format on y-axes', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <ScatterPlot
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    yAxisMeasure={MEASURE_WITH_FORMAT}
                    attribute={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ));
