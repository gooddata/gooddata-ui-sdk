// (C) 2007-2019 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { ComboChart, VisualizationTypes } from '../../src';
import { onErrorHandler } from '../mocks';
import {
    ATTRIBUTE_1,
    MEASURE_1,
    MEASURE_2,
    ATTRIBUTE_1_SORT_ITEM,
    MEASURE_2_SORT_ITEM,
    ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
    ARITHMETIC_MEASURE_USING_ARITHMETIC
} from '../data/componentProps';
import { GERMAN_SEPARATORS } from '../data/numberFormat';
import { CUSTOM_COLOR_PALETTE_CONFIG } from '../data/configProps';

const wrapperStyle = { width: 800, height: 400 };
const primaryMeasure = [MEASURE_1];
const secondaryMeasure = [MEASURE_2];
const arithmeticMeasures = [ARITHMETIC_MEASURE_SIMPLE_OPERANDS, ARITHMETIC_MEASURE_USING_ARITHMETIC];

storiesOf('Core components/ComboChart', module)
    .add('dual axis with one column measure, one line measure, one attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={secondaryMeasure}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('dual axis with one column measure, one area measure, one attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={secondaryMeasure}
                    viewBy={ATTRIBUTE_1}
                    config={{
                        secondaryChartType: VisualizationTypes.AREA
                    }}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('dual axis with one line measure, one area measure, one attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={secondaryMeasure}
                    viewBy={ATTRIBUTE_1}
                    config={{
                        primaryChartType: VisualizationTypes.LINE,
                        secondaryChartType: VisualizationTypes.AREA
                    }}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('single axis with one column measure, one line measures, one attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={secondaryMeasure}
                    viewBy={ATTRIBUTE_1}
                    config={{ dualAxis: false }}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('dual axis with same chart type', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={secondaryMeasure}
                    viewBy={ATTRIBUTE_1}
                    config={{
                        secondaryChartType: VisualizationTypes.COLUMN
                    }}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('empty secondary measures', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={[]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('empty primary measures', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={[]}
                    secondaryMeasures={secondaryMeasure}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('custom colors', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={secondaryMeasure}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={CUSTOM_COLOR_PALETTE_CONFIG}
                />
            </div>
        )
    ))
    .add('sorted by attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={secondaryMeasure}
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
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={secondaryMeasure}
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
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={secondaryMeasure}
                    viewBy={ATTRIBUTE_1}
                    config={GERMAN_SEPARATORS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('arithmetic measures', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={arithmeticMeasures}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ));
