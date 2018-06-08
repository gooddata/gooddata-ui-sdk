// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { screenshotWrap } from '@gooddata/test-storybook';
import { wrap } from '../utils/wrap';
import HeadlineTransformation from '../../src/components/visualizations/headline/HeadlineTransformation';
import { headlineWithOneMeasure, headlineWithTwoMeasures } from '../data/headlineExecutionFixtures';
import '../../styles/scss/headline.scss';

storiesOf('Internal/HeadlineTransformation', module)
    .add('Drillable primary value', () =>
        screenshotWrap(
            wrap(
                <HeadlineTransformation
                    executionRequest={headlineWithOneMeasure.executionRequest}
                    executionResponse={headlineWithOneMeasure.executionResponse}
                    executionResult={headlineWithOneMeasure.executionResult}
                    drillableItems={[{
                        identifier: 'af2Ewj9Re2vK',
                        uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283'
                    }]}
                    onFiredDrillEvent={action('onFiredDrillEvent')}
                    onAfterRender={action('onAfterRender')}
                />,
                'auto', 300)
        )
    )
    .add('Drillable secondary value', () =>
        screenshotWrap(
            wrap(
                <HeadlineTransformation
                    executionRequest={headlineWithTwoMeasures.executionRequest}
                    executionResponse={headlineWithTwoMeasures.executionResponse}
                    executionResult={headlineWithTwoMeasures.executionResult}
                    drillableItems={[{
                        identifier: 'af2Ewj9Re2vK',
                        uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283'
                    }, {
                        identifier: 'afSEwRwdbMeQ',
                        uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1284'
                    }]}
                    onFiredDrillEvent={action('onFiredDrillEvent')}
                    onAfterRender={action('onAfterRender')}
                />,
                'auto', 300)
        )
    );
