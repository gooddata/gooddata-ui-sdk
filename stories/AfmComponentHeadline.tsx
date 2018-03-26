import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';
import {
    AFM_ONE_MEASURE,
    AFM_TWO_MEASURES
} from './data/afmComponentProps';
import { Headline } from '../src/components/afm/Headline';
import '../styles/scss/headline.scss';

storiesOf('AFM components/Headline', module)
    .add('one measure', () => (
        screenshotWrap(
            <div style={{ width: 600, height: 300 }}>
                <Headline
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('two measures', () => (
        screenshotWrap(
            <div style={{ width: 600, height: 300 }}>
                <Headline
                    projectId="storybook"
                    afm={AFM_TWO_MEASURES}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ));
