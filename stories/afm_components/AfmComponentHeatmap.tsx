// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { Heatmap } from '../../src/components/afm/Heatmap';
import {
    AFM_ONE_MEASURE,
    AFM_ONE_MEASURE_ONE_ATTRIBUTE,
    AFM_ONE_MEASURE_TWO_ATTRIBUTES_ONE_RENAMED_ATTRIBUTE,
    AFM_ONE_MEASURE_TWO_ATTRIBUTES,
    AFM_HEATMAP_60ROWS,
    AFM_HEATMAP_58ROWS
} from '../data/afmComponentProps';
import { onErrorHandler } from '../mocks';
import '../../styles/scss/charts.scss';
import { GERMAN_SEPARATORS } from '../data/numberFormat';

const wrapperStyle = { width: 800, height: 400 };

storiesOf('AFM components/Heatmap', module)
    .add('metric row column', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_TWO_ATTRIBUTES}
                    onError={onErrorHandler}
                    resultSpec={{
                        dimensions: [
                            {
                                itemIdentifiers: ['a1']
                            },
                            {
                                itemIdentifiers: ['a2', 'measureGroup']
                            }
                        ]
                    }}
                />
            </div>
        )
    ))
    .add('metric only', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('metric and row', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_ONE_ATTRIBUTE}
                    onError={onErrorHandler}
                    resultSpec={{
                        dimensions: [
                            {
                                itemIdentifiers: ['a1']
                            },
                            {
                                itemIdentifiers: ['measureGroup']
                            }
                        ]
                    }}
                />
            </div>
        )
    ))
    .add('metric and column', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_ONE_ATTRIBUTE}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('metric row column with row alias', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_TWO_ATTRIBUTES_ONE_RENAMED_ATTRIBUTE}
                    onError={onErrorHandler}
                    resultSpec={{
                        dimensions: [
                            {
                                itemIdentifiers: ['a1']
                            },
                            {
                                itemIdentifiers: ['a2', 'measureGroup']
                            }
                        ]
                    }}
                />
            </div>
        )
    ))
    .add('metric row column with cloumn alias', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_TWO_ATTRIBUTES_ONE_RENAMED_ATTRIBUTE}
                    onError={onErrorHandler}
                    resultSpec={{
                        dimensions: [
                            {
                                itemIdentifiers: ['a2']
                            },
                            {
                                itemIdentifiers: ['a1', 'measureGroup']
                            }
                        ]
                    }}
                />
            </div>
        )
    ))
    .add('with German number format', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_TWO_ATTRIBUTES}
                    config={GERMAN_SEPARATORS}
                    onError={onErrorHandler}
                    resultSpec={{
                        dimensions: [
                            {
                                itemIdentifiers: ['a1']
                            },
                            {
                                itemIdentifiers: ['a2', 'measureGroup']
                            }
                        ]
                    }}
                />
            </div>
        )
    ))
    .add('with left out some label of yaxis', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    afm={AFM_HEATMAP_60ROWS}
                    onError={onErrorHandler}
                    resultSpec={{
                        dimensions: [
                            {
                                itemIdentifiers: ['60countries']
                            },
                            {
                                itemIdentifiers: ['Popularity', 'measureGroup']
                            }
                        ]
                    }}
                />
            </div>
        )
    ))
    .add('with last label of yaxis exceed top grid line', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Heatmap
                    projectId="storybook"
                    afm={AFM_HEATMAP_58ROWS}
                    onError={onErrorHandler}
                    resultSpec={{
                        dimensions: [
                            {
                                itemIdentifiers: ['58countries']
                            },
                            {
                                itemIdentifiers: ['Popularity', 'measureGroup']
                            }
                        ]
                    }}
                />
            </div>
        )
    ));
