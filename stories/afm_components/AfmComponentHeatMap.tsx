import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { HeatMap } from '../../src/components/afm/HeatMap';
import {
    AFM_ONE_MEASURE,
    AFM_ONE_MEASURE_ONE_ATTRIBUTE,
    AFM_ONE_MEASURE_TWO_ATTRIBUTES_ONE_RENAMED_ATTRIBUTE,
    AFM_ONE_MEASURE_TWO_ATTRIBUTES
} from '../data/afmComponentProps';
import { onErrorHandler } from '../mocks';
import '../../styles/scss/charts.scss';

const wrapperStyle = { width: 800, height: 400 };

storiesOf('AFM components/Heat Map', module)
    .add('metric row column', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <HeatMap
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
                <HeatMap
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
                <HeatMap
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
                <HeatMap
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
                <HeatMap
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
                <HeatMap
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
    ));
