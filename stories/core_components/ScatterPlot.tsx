// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { ScatterPlot } from '../../src/index';
import { onErrorHandler } from '../mocks';
import {
    ATTRIBUTE_1,
    ATTRIBUTE_3,
    MEASURE_1,
    MEASURE_2,
    ATTRIBUTE_1_SORT_ITEM,
    MEASURE_WITH_FORMAT
} from '../data/componentProps';
import { GERMAN_SEPARATORS } from '../data/numberFormat';
import {
    DATA_LABELS_VISIBLE_CONFIG,
    DATA_LABELS_HIDDEN_CONFIG,
    DATA_LABELS_AUTO_CONFIG
} from '../data/configProps';

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
    ))
    .add('with German number format in tooltip', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <ScatterPlot
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    yAxisMeasure={MEASURE_2}
                    attribute={ATTRIBUTE_1}
                    config={GERMAN_SEPARATORS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('with min/max config', () => (
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
                    config={{
                        xaxis: {
                            min: '600'
                        },
                        yaxis: {
                            min: '500',
                            max: '950'
                        }
                    }}
                />
            </div>
        )
    ))
    .add('data labels config', () => (
        screenshotWrap(
            <div>
                <div className="storybook-title">default = hidden</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <ScatterPlot
                        projectId="storybook"
                        xAxisMeasure={MEASURE_1}
                        yAxisMeasure={MEASURE_2}
                        attribute={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                    />
                </div>
                <div className="storybook-title">auto</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <ScatterPlot
                        projectId="storybook"
                        xAxisMeasure={MEASURE_1}
                        yAxisMeasure={MEASURE_2}
                        attribute={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        config={DATA_LABELS_AUTO_CONFIG}
                    />
                </div>
                <div className="storybook-title">show</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <ScatterPlot
                        projectId="storybook"
                        xAxisMeasure={MEASURE_1}
                        yAxisMeasure={MEASURE_2}
                        attribute={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        config={DATA_LABELS_VISIBLE_CONFIG}
                    />
                </div>
                <div className="storybook-title">hide</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <ScatterPlot
                        projectId="storybook"
                        xAxisMeasure={MEASURE_1}
                        yAxisMeasure={MEASURE_2}
                        attribute={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        config={DATA_LABELS_HIDDEN_CONFIG}
                    />
                </div>
            </div>
        )
    ));
