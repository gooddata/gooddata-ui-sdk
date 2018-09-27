// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { DonutChart } from '../../src/index';
import { onErrorHandler } from '../mocks';
import {
    ATTRIBUTE_1,
    ATTRIBUTE_1_WITH_ALIAS,
    ATTRIBUTE_3,
    MEASURE_1,
    MEASURE_1_WITH_ALIAS,
    MEASURE_2
} from '../data/componentProps';
import { GERMAN_SEPARATORS } from '../data/numberFormat';
import {
    DATA_LABELS_VISIBLE_CONFIG,
    DATA_LABELS_HIDDEN_CONFIG,
    DATA_LABELS_AUTO_CONFIG
} from '../data/configProps';

const wrapperStyle = { width: 400, height: 400 };

storiesOf('Core components/DonutChart', module)
    .add('two measures', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <DonutChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('measure and attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <DonutChart
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
    .add('one measure with alias, one attribute with alias', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <DonutChart
                    projectId="storybook"
                    measures={[MEASURE_1_WITH_ALIAS]}
                    viewBy={ATTRIBUTE_1_WITH_ALIAS}
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
                <DonutChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    config={GERMAN_SEPARATORS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('with disabled legend', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <DonutChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        legend: {
                            enabled: false
                        }
                    }}
                />
            </div>
        )
    ))
    .add('with different legend positions', () => (
        screenshotWrap(
            <div>
                <div className="storybook-title">default = auto</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <DonutChart
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_1}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        config={{
                            legend: {
                                position: 'auto'
                            }
                        }}
                    />
                </div>
                <div className="storybook-title">left</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <DonutChart
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_1}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        config={{
                            legend: {
                                position: 'left'
                            }
                        }}
                    />
                </div>
                <div className="storybook-title">top</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <DonutChart
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_1}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        config={{
                            legend: {
                                position: 'top'
                            }
                        }}
                    />
                </div>
                <div className="storybook-title">right</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <DonutChart
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_1}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        config={{
                            legend: {
                                position: 'right'
                            }
                        }}
                    />
                </div>
                <div className="storybook-title">bottom</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <DonutChart
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_1}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        config={{
                            legend: {
                                position: 'bottom'
                            }
                        }}
                    />
                </div>
            </div>
        )
    )).add('data labels config', () => (
        screenshotWrap(
            <div>
                <div className="storybook-title">default = hidden</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <DonutChart
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                    />
                </div>
                <div className="storybook-title">auto</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <DonutChart
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        config={DATA_LABELS_AUTO_CONFIG}
                    />
                </div>
                <div className="storybook-title">show</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <DonutChart
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        config={DATA_LABELS_VISIBLE_CONFIG}
                    />
                </div>
                <div className="storybook-title">hide</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <DonutChart
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        config={DATA_LABELS_HIDDEN_CONFIG}
                    />
                </div>
            </div>
        )
    ));
