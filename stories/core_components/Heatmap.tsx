import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { Heatmap } from '../../src/index';
import { onErrorHandler } from '../mocks';
import {
    ATTRIBUTE_1,
    ATTRIBUTE_2,
    ATTRIBUTE_3,
    MEASURE_1,
    ATTRIBUTE_1_WITH_ALIAS
} from '../data/componentProps';
import { GERMAN_SEPARATORS } from '../data/numberFormat';
import {
    DATA_LABELS_VISIBLE_CONFIG,
    DATA_LABELS_HIDDEN_CONFIG,
    DATA_LABELS_AUTO_CONFIG
} from '../data/configProps';

const wrapperStyle = { width: 800, height: 400 };
const wrapperWiderStyle = { width: 1000, height: 400 };

storiesOf('Core components/Heatmap', module)
    .add('metric row column', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    measure={MEASURE_1}
                    segmentBy={ATTRIBUTE_1}
                    trendBy={ATTRIBUTE_2}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('metric only', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    measure={MEASURE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('metric and columns', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    measure={MEASURE_1}
                    trendBy={ATTRIBUTE_2}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('metric and rows', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    measure={MEASURE_1}
                    segmentBy={ATTRIBUTE_2}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('metric row column with row alias', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    measure={MEASURE_1}
                    segmentBy={ATTRIBUTE_1_WITH_ALIAS}
                    trendBy={ATTRIBUTE_2}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('metric row column with cloumn alias', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    measure={MEASURE_1}
                    segmentBy={ATTRIBUTE_2}
                    trendBy={ATTRIBUTE_1_WITH_ALIAS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('with German number format', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    measure={MEASURE_1}
                    segmentBy={ATTRIBUTE_1}
                    trendBy={ATTRIBUTE_2}
                    config={GERMAN_SEPARATORS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('with legend on top', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    measure={MEASURE_1}
                    segmentBy={ATTRIBUTE_1}
                    trendBy={ATTRIBUTE_2}
                    config={{ legend: { position: 'top' } }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    )).add('data labels config', () => (
        screenshotWrap(
            <div>
                <div className="storybook-title">default = auto</div>
                <div style={wrapperWiderStyle} className="screenshot-container">
                    <Heatmap
                        projectId="storybook"
                        measure={MEASURE_1}
                        segmentBy={ATTRIBUTE_1}
                        trendBy={ATTRIBUTE_3}
                        onError={onErrorHandler}
                    />
                </div>
                <div className="storybook-title">auto</div>
                <div style={wrapperWiderStyle} className="screenshot-container">
                    <Heatmap
                        projectId="storybook"
                        measure={MEASURE_1}
                        segmentBy={ATTRIBUTE_1}
                        trendBy={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        config={DATA_LABELS_AUTO_CONFIG}
                    />
                </div>
                <div className="storybook-title">show</div>
                <div style={wrapperWiderStyle} className="screenshot-container">
                    <Heatmap
                        projectId="storybook"
                        measure={MEASURE_1}
                        segmentBy={ATTRIBUTE_1}
                        trendBy={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        config={DATA_LABELS_VISIBLE_CONFIG}
                    />
                </div>
                <div className="storybook-title">hide</div>
                <div style={wrapperWiderStyle} className="screenshot-container">
                    <Heatmap
                        projectId="storybook"
                        measure={MEASURE_1}
                        segmentBy={ATTRIBUTE_1}
                        trendBy={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        config={DATA_LABELS_HIDDEN_CONFIG}
                    />
                </div>
            </div>
        )
    ));
