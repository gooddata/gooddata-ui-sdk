import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { Table } from '../src/components/afm/Table';
import {
    AFM_TWO_MEASURES_ONE_ATTRIBUTE
} from './data/afmComponentProps';
import { onErrorHandler } from './mocks';
import '../styles/scss/charts.scss';

storiesOf('AFM components - Table', module)
    .add('two measures, one attribute', () => (
        screenshotWrap(
            <div style={{ width: 600, height: 300 }}>
                <Table
                    projectId="storybook"
                    afm={AFM_TWO_MEASURES_ONE_ATTRIBUTE}
                    onError={onErrorHandler}
                />
            </div>
        )
    ));
