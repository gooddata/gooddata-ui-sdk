import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { screenshotWrap } from '@gooddata/test-storybook';

import { Table } from '../src/components/afm/Table';
import {
    AFM_TWO_MEASURES_ONE_ATTRIBUTE,
    RESULT_SPEC_TWO_MEASURES_ONE_ATTRIBUTE_TOTALS
} from './data/afmComponentProps';
import { onErrorHandler } from './mocks';
import '../styles/scss/charts.scss';

function logTotalsChange(data: any) {
    if (data.properties && data.properties.totals) {
        action('totals changed')(data.properties.totals);
    }
}

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
    ))
    .add('with table totals', () => (
        screenshotWrap(
            <div style={{ width: 600, height: 300 }}>
                <Table
                    projectId="storybook"
                    afm={AFM_TWO_MEASURES_ONE_ATTRIBUTE}
                    onError={onErrorHandler}
                    resultSpec={RESULT_SPEC_TWO_MEASURES_ONE_ATTRIBUTE_TOTALS}
                />
            </div>
        )
    ))
    .add('with table totals editable', () => (
        screenshotWrap(
            <div style={{ width: 600, height: 300 }}>
                <Table
                    projectId="storybook"
                    afm={AFM_TWO_MEASURES_ONE_ATTRIBUTE}
                    onError={onErrorHandler}
                    totalsEditAllowed={true}
                    resultSpec={RESULT_SPEC_TWO_MEASURES_ONE_ATTRIBUTE_TOTALS}
                    pushData={logTotalsChange}
                />
            </div>
        )
    ));
