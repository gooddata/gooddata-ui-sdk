import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { screenshotWrap } from '@gooddata/test-storybook';

import { Table } from '../src';
import { onErrorHandler } from './mocks';
import {
    ATTRIBUTE_1,
    ATTRIBUTE_1_WITH_ALIAS,
    ATTRIBUTE_2,
    MEASURE_1,
    MEASURE_1_WITH_ALIAS,
    MEASURE_2,
    TOTAL_M1_A1,
    TOTAL_M2_A1
} from './data/componentProps';

function logTotalsChange(data: any) {
    if (data.properties && data.properties.totals) {
        action('totals changed')(data.properties.totals);
    }
}

storiesOf('Table', module)
    .add('two measures, one attribute', () => (
        screenshotWrap(
            <div style={{ width: 600, height: 300 }}>
                <Table
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    attributes={[ATTRIBUTE_1]}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('renamed measure and renamed attribute', () => (
        screenshotWrap(
            <div style={{ width: 600, height: 300 }}>
                <Table
                    projectId="storybook"
                    measures={[MEASURE_1_WITH_ALIAS]}
                    attributes={[ATTRIBUTE_1_WITH_ALIAS]}
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
                    measures={[MEASURE_1, MEASURE_2]}
                    attributes={[ATTRIBUTE_1]}
                    totals={[TOTAL_M1_A1, TOTAL_M2_A1]}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('with table totals editable', () => (
        screenshotWrap(
             <div style={{ width: 600, height: 300 }}>
                <Table
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    attributes={[ATTRIBUTE_1]}
                    totals={[TOTAL_M1_A1, TOTAL_M2_A1]}
                    totalsEditAllowed={true}
                    onError={onErrorHandler}
                    pushData={logTotalsChange}
                />
            </div>
        )
    ))
    .add('table with resizing', () => (
        screenshotWrap(
            <div
                style={{
                    width: 800,
                    height: 400,
                    padding: 10,
                    border: 'solid 1px #000000',
                    resize: 'both',
                    overflow: 'auto'
                }}
            >
                <Table
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    attributes={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    totals={[TOTAL_M1_A1, TOTAL_M2_A1]}
                    totalsEditAllowed={true}
                    onError={onErrorHandler}
                    pushData={logTotalsChange}
                />
            </div>
        )
    ));
