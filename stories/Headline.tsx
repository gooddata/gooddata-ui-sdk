import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { Headline } from '../src';
import { MEASURE_1_WITH_ALIAS } from './data/componentProps';

storiesOf('Headline', module)
    .add('one measure with alias', () => (
        screenshotWrap(
            <div style={{ width: 600, height: 300 }}>
                <Headline
                    projectId="storybook"
                    measure={MEASURE_1_WITH_ALIAS}
                />
            </div>
        )
    ));
