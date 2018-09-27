// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { BarChart } from '../../src/index';
import { onErrorHandler } from '../mocks';
import { CUSTOM_COLORS } from '../data/colors';
import {
    ATTRIBUTE_1,
    ATTRIBUTE_2,
    MEASURE_1,
    MEASURE_1_WITH_ALIAS,
    MEASURE_2,
    ATTRIBUTE_1_SORT_ITEM,
    MEASURE_2_SORT_ITEM
} from '../data/componentProps';
import { GERMAN_SEPARATORS } from '../data/numberFormat';

const wrapperStyle = { width: 800, height: 400 };

storiesOf('Core components/BarChart', module)
    .add('two measures, one attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('stacked', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_2}
                    stackBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('one measure with alias', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1_WITH_ALIAS]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('custom colors', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    config={{ colors: CUSTOM_COLORS }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('sorted by attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    sortBy={[ATTRIBUTE_1_SORT_ITEM]}
                />
            </div>
        )
    ))
    .add('sorted by measure', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    sortBy={[MEASURE_2_SORT_ITEM]}
                />
            </div>
        )
    ))
    .add('with German number format', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    config={GERMAN_SEPARATORS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    )).add('with dataLabels explicitly hidden', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    config={{
                        dataLabels: {
                            visible: false
                        }
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    )).add('with disabled legend', () => (
    screenshotWrap(
        <div style={wrapperStyle}>
            <BarChart
                projectId="storybook"
                measures={[MEASURE_1, MEASURE_2]}
                viewBy={ATTRIBUTE_1}
                config={{
                    legend: {
                        enabled: false
                    }
                }}
                onError={onErrorHandler}
                LoadingComponent={null}
                ErrorComponent={null}
            />
        </div>
    ))).add('with min max config', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        xaxis: {
                            min: '100',
                            max: '600'
                        }
                    }}
                />
            </div>
        )
    )).add('with different legend positions', () => (
        screenshotWrap(
            <div>
                <div className="storybook-title">default = auto</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <BarChart
                        projectId="storybook"
                        measures={[MEASURE_1, MEASURE_2]}
                        viewBy={ATTRIBUTE_1}
                        config={{
                            legend: {
                                position: 'auto'
                            }
                        }}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                    />
                </div>
                <div className="storybook-title">left</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <BarChart
                        projectId="storybook"
                        measures={[MEASURE_1, MEASURE_2]}
                        viewBy={ATTRIBUTE_1}
                        config={{
                            legend: {
                                position: 'left'
                            }
                        }}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                    />
                </div>
                <div className="storybook-title">top</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <BarChart
                        projectId="storybook"
                        measures={[MEASURE_1, MEASURE_2]}
                        viewBy={ATTRIBUTE_1}
                        config={{
                            legend: {
                                position: 'top'
                            }
                        }}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                    />
                </div>
                <div className="storybook-title">right</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <BarChart
                        projectId="storybook"
                        measures={[MEASURE_1, MEASURE_2]}
                        viewBy={ATTRIBUTE_1}
                        config={{
                            legend: {
                                position: 'right'
                            }
                        }}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                    />
                </div>
                <div className="storybook-title">bottom</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <BarChart
                        projectId="storybook"
                        measures={[MEASURE_1, MEASURE_2]}
                        viewBy={ATTRIBUTE_1}
                        config={{
                            legend: {
                                position: 'bottom'
                            }
                        }}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                    />
                </div>
            </div>
        ))
    );
