// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { screenshotWrap } from '@gooddata/test-storybook';

import { Table } from '../../src';
import { onErrorHandler } from '../mocks';
import {
    ATTRIBUTE_1,
    ATTRIBUTE_1_WITH_ALIAS,
    ATTRIBUTE_2,
    ATTRIBUTE_COUNTRY,
    MEASURE_1,
    MEASURE_1_WITH_ALIAS,
    MEASURE_2,
    TOTAL_M1_A1,
    TOTAL_M2_A1,
    TOTAL_M1_ACOUNTRY_AVG,
    TOTAL_M1_ACOUNTRY_SUM,
    ATTRIBUTE_1_SORT_ITEM,
    MEASURE_2_SORT_ITEM,
    MEASURE_2_WITH_FORMAT,
    MEASURE_WITH_NULLS,
    FORMATTED_ARITHMETIC_MEASURE,
    ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
    ARITHMETIC_MEASURE_USING_ARITHMETIC
} from '../data/componentProps';
import { GERMAN_SEPARATORS } from '../data/numberFormat';

function logTotalsChange(data: any) {
    if (data.properties && data.properties.totals) {
        action('totals changed')(data.properties.totals);
    }
}

const wrapperStyle = { width: 600, height: 300 };

storiesOf('Core components/Table', module)
    .add('two measures, one attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Table
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    attributes={[ATTRIBUTE_1]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('renamed measure and renamed attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Table
                    projectId="storybook"
                    measures={[MEASURE_1_WITH_ALIAS]}
                    attributes={[ATTRIBUTE_1_WITH_ALIAS]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('with table totals', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Table
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    attributes={[ATTRIBUTE_1]}
                    totals={[TOTAL_M1_A1, TOTAL_M2_A1]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('with table totals editable', () => (
        screenshotWrap(
             <div style={wrapperStyle}>
                <Table
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    attributes={[ATTRIBUTE_1]}
                    totals={[TOTAL_M1_A1, TOTAL_M2_A1]}
                    totalsEditAllowed={true}
                    onError={onErrorHandler}
                    pushData={logTotalsChange}
                    LoadingComponent={null}
                    ErrorComponent={null}
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
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    )).add('sorted by attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Table
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    attributes={[ATTRIBUTE_1]}
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
                <Table
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    attributes={[ATTRIBUTE_1]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    sortBy={[MEASURE_2_SORT_ITEM]}
                />
            </div>
        )
    ))
    .add('custom number separators', () => (
        screenshotWrap(
             <div style={wrapperStyle}>
                <Table
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    attributes={[ATTRIBUTE_1]}
                    config={GERMAN_SEPARATORS}
                    onError={onErrorHandler}
                    pushData={logTotalsChange}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('custom measure format', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Table
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2_WITH_FORMAT]}
                    attributes={[ATTRIBUTE_1]}
                    onError={onErrorHandler}
                    pushData={logTotalsChange}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('empty value', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Table
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_WITH_NULLS]}
                    attributes={[ATTRIBUTE_1]}
                    onError={onErrorHandler}
                    pushData={logTotalsChange}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('with supplied height of container', () => (
        screenshotWrap(
            <div>
                <div style={{ width: 600, height: 100 }}>
                    <Table
                        environment="dashboards"
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        attributes={[ATTRIBUTE_COUNTRY]}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        height={100}
                    />
                </div>
                <div style={{ width: 600, height: 200 }}>
                    <Table
                        environment="dashboards"
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        attributes={[ATTRIBUTE_COUNTRY]}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        height={200}
                    />
                </div>
                <div style={{ width: 600, height: 400 }}>
                    <Table
                        environment="dashboards"
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        attributes={[ATTRIBUTE_COUNTRY]}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        height={400}
                    />
                </div>
                <div style={{ width: 600, height: 800 }}>
                    <Table
                        environment="dashboards"
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        attributes={[ATTRIBUTE_COUNTRY]}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        height={800}
                    />
                </div>
            </div>
        )
    ))
    .add('with table totals and supplied height of container', () => (
        screenshotWrap(
            <div>
                <div style={{ width: 600, height: 100 }}>
                    <Table
                        environment="dashboards"
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        attributes={[ATTRIBUTE_COUNTRY]}
                        totals={[TOTAL_M1_ACOUNTRY_AVG, TOTAL_M1_ACOUNTRY_SUM]}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        height={100}
                    />
                </div>
                <div style={{ width: 600, height: 200 }}>
                    <Table
                        environment="dashboards"
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        attributes={[ATTRIBUTE_COUNTRY]}
                        totals={[TOTAL_M1_ACOUNTRY_AVG, TOTAL_M1_ACOUNTRY_SUM]}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        height={200}
                    />
                </div>
                <div style={{ width: 600, height: 400 }}>
                    <Table
                        environment="dashboards"
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        attributes={[ATTRIBUTE_COUNTRY]}
                        totals={[TOTAL_M1_ACOUNTRY_AVG, TOTAL_M1_ACOUNTRY_SUM]}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        height={400}
                    />
                </div>
                <div style={{ width: 600, height: 800 }}>
                    <Table
                        environment="dashboards"
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        attributes={[ATTRIBUTE_COUNTRY]}
                        totals={[TOTAL_M1_ACOUNTRY_AVG, TOTAL_M1_ACOUNTRY_SUM]}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        height={800}
                    />
                </div>
            </div>
        )
    ))
    .add('arithmetic measures', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Table
                    projectId="storybook"
                    measures={[
                        MEASURE_1,
                        MEASURE_2,
                        ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
                        ARITHMETIC_MEASURE_USING_ARITHMETIC
                    ]}
                    attributes={[ATTRIBUTE_1]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('formatted arithmetic measure', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Table
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2, FORMATTED_ARITHMETIC_MEASURE]}
                    attributes={[ATTRIBUTE_1]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ));
