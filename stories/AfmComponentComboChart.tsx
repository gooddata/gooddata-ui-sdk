// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { ComboChart } from '../src/components/afm/ComboChart';
import {
    AFM_ONE_MEASURE_ONE_ATTRIBUTE,
    AFM_TWO_MEASURES_ONE_ATTRIBUTE,
    AFM_TWO_MEASURES_ONE_RENAMED_ATTRIBUTE,
    AFM_TWO_MEASURES_ONE_ATTRIBUTE_COMBO_MD_OBJECT,
    AFM_ONE_BAR_MEASURE_ONE_ATTRIBUTE_COMBO_MD_OBJECT,
    AFM_ONE_LINE_MEASURE_ONE_ATTRIBUTE_COMBO_MD_OBJECT
} from './data/afmComponentProps';
import { CUSTOM_COLORS } from './data/colors';
import { onErrorHandler } from './mocks';
import '../styles/scss/charts.scss';

storiesOf('AFM components/ComboChart', module)
    .add('two measures, one attribute', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <ComboChart
                    projectId="storybook"
                    afm={AFM_TWO_MEASURES_ONE_ATTRIBUTE}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={
                        {
                            mdObject: AFM_TWO_MEASURES_ONE_ATTRIBUTE_COMBO_MD_OBJECT
                        }
                    }
                />
            </div>
        )
    ))
    .add('two measures, one renamed attribute', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <ComboChart
                    projectId="storybook"
                    afm={AFM_TWO_MEASURES_ONE_RENAMED_ATTRIBUTE}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={
                        {
                            mdObject: AFM_TWO_MEASURES_ONE_ATTRIBUTE_COMBO_MD_OBJECT
                        }
                    }
                />
            </div>
        )
    ))
    .add('custom colors', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <ComboChart
                    projectId="storybook"
                    afm={AFM_TWO_MEASURES_ONE_RENAMED_ATTRIBUTE}
                    config={{
                        colors: CUSTOM_COLORS,
                        mdObject: AFM_TWO_MEASURES_ONE_ATTRIBUTE_COMBO_MD_OBJECT
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('only bar', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <ComboChart
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_ONE_ATTRIBUTE}
                    config={{
                        mdObject: AFM_ONE_BAR_MEASURE_ONE_ATTRIBUTE_COMBO_MD_OBJECT
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('only line', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <ComboChart
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_ONE_ATTRIBUTE}
                    config={{
                        mdObject: AFM_ONE_LINE_MEASURE_ONE_ATTRIBUTE_COMBO_MD_OBJECT
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ));
