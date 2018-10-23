// (C) 2007-2018 GoodData Corporation
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
    MEASURE_2,
    ATTRIBUTE_1_WITH_ALIAS,
    ATTRIBUTE_COUNTRY,
    ATTRIBUTE_POPULARITY
} from '../data/componentProps';
import { GERMAN_SEPARATORS } from '../data/numberFormat';
import {
    DATA_LABELS_VISIBLE_CONFIG,
    DATA_LABELS_HIDDEN_CONFIG,
    DATA_LABELS_AUTO_CONFIG,
    CUSTOM_COLOR_PALETTE_CONFIG
} from '../data/configProps';
import { getMeasureLocalIdentifierPredicate } from '../../src/helpers/predicatesFactory';

const wrapperStyle = { width: 800, height: 400 };
const wrapperWiderStyle = { width: 1000, height: 400 };

storiesOf('Core components/Heatmap', module)
    .add('metric row column', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    measure={MEASURE_1}
                    rows={ATTRIBUTE_1}
                    columns={ATTRIBUTE_2}
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
    .add('metric and rows', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    measure={MEASURE_1}
                    rows={ATTRIBUTE_2}
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
                    columns={ATTRIBUTE_2}
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
                    rows={ATTRIBUTE_1_WITH_ALIAS}
                    columns={ATTRIBUTE_2}
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
                    rows={ATTRIBUTE_2}
                    columns={ATTRIBUTE_1_WITH_ALIAS}
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
                    rows={ATTRIBUTE_1}
                    columns={ATTRIBUTE_2}
                    config={GERMAN_SEPARATORS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('with left out some label of yaxis', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    measure={MEASURE_1}
                    rows={ATTRIBUTE_COUNTRY}
                    columns={ATTRIBUTE_POPULARITY}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('with last label of yaxis exceed top grid line', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    measure={MEASURE_2}
                    rows={ATTRIBUTE_COUNTRY}
                    columns={ATTRIBUTE_POPULARITY}
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
                <Heatmap
                    projectId="storybook"
                    measure={MEASURE_1}
                    rows={ATTRIBUTE_1}
                    columns={ATTRIBUTE_2}
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
                    <Heatmap
                        projectId="storybook"
                        measure={MEASURE_1}
                        rows={ATTRIBUTE_1}
                        columns={ATTRIBUTE_2}
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
                    <Heatmap
                        projectId="storybook"
                        measure={MEASURE_1}
                        rows={ATTRIBUTE_1}
                        columns={ATTRIBUTE_2}
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
                    <Heatmap
                        projectId="storybook"
                        measure={MEASURE_1}
                        rows={ATTRIBUTE_1}
                        columns={ATTRIBUTE_2}
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
                    <Heatmap
                        projectId="storybook"
                        measure={MEASURE_1}
                        rows={ATTRIBUTE_1}
                        columns={ATTRIBUTE_2}
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
                    <Heatmap
                        projectId="storybook"
                        measure={MEASURE_1}
                        rows={ATTRIBUTE_1}
                        columns={ATTRIBUTE_2}
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
                <div className="storybook-title">default = auto</div>
                <div style={wrapperWiderStyle} className="screenshot-container">
                    <Heatmap
                        projectId="storybook"
                        measure={MEASURE_1}
                        rows={ATTRIBUTE_1}
                        columns={ATTRIBUTE_3}
                        onError={onErrorHandler}
                    />
                </div>
                <div className="storybook-title">auto</div>
                <div style={wrapperWiderStyle} className="screenshot-container">
                    <Heatmap
                        projectId="storybook"
                        measure={MEASURE_1}
                        rows={ATTRIBUTE_1}
                        columns={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        config={DATA_LABELS_AUTO_CONFIG}
                    />
                </div>
                <div className="storybook-title">show</div>
                <div style={wrapperWiderStyle} className="screenshot-container">
                    <Heatmap
                        projectId="storybook"
                        measure={MEASURE_1}
                        rows={ATTRIBUTE_1}
                        columns={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        config={DATA_LABELS_VISIBLE_CONFIG}
                    />
                </div>
                <div className="storybook-title">hide</div>
                <div style={wrapperWiderStyle} className="screenshot-container">
                    <Heatmap
                        projectId="storybook"
                        measure={MEASURE_1}
                        rows={ATTRIBUTE_1}
                        columns={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        config={DATA_LABELS_HIDDEN_CONFIG}
                    />
                </div>
            </div>
        )
    )).add('custom colors', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    measure={MEASURE_1}
                    rows={ATTRIBUTE_1}
                    columns={ATTRIBUTE_2}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={CUSTOM_COLOR_PALETTE_CONFIG}
                />
            </div>
        )
    )).add('custom colors with color mapping', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    measure={MEASURE_1}
                    columns={ATTRIBUTE_1}
                    rows={ATTRIBUTE_2}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        colorMapping: [
                            {
                                predicate: getMeasureLocalIdentifierPredicate('m1'),
                                color: {
                                    type: 'guid',
                                    value: 'green'
                                }
                            }
                        ]
                    }}
                />
            </div>
        )
    ));
