// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { range, cloneDeep } from 'lodash';
import { screenshotWrap } from '@gooddata/test-storybook';
import { AFM, Execution } from '@gooddata/typings';

import { IntlWrapper } from '../../src/components/core/base/IntlWrapper';
import { TableTransformation } from '../../src/components/visualizations/table/TableTransformation';
import { IResponsiveTableProps, ResponsiveTable } from '../../src/components/visualizations/table/ResponsiveTable';
import { IIndexedTotalItem } from '../../src/interfaces/Totals';

import '../../styles/scss/table.scss';

import {
    EXECUTION_REQUEST_2A_1M,
    EXECUTION_RESPONSE_2A_1M,
    EXECUTION_RESULT_2A_1M
} from '../../src/components/visualizations/table/fixtures/2attributes1measure';

import {
    EXECUTION_REQUEST_2A_3M,
    EXECUTION_RESPONSE_2A_3M,
    EXECUTION_RESULT_2A_3M
} from '../../src/components/visualizations/table/fixtures/2attributes3measures';
import { GERMAN_NUMBER_FORMAT } from '../data/numberFormat';

const tableWrap = (component: JSX.Element) => (
    <IntlWrapper locale="en-US">
        <div>
            {component}
        </div>
    </IntlWrapper>
);

function generateExecutionRequest() {
    // no needed exact executionRequest for these storybook usages where is no sorting
    return {
        execution: {
            afm: {},
            resultSpec: {}
        }
    };
}

function generateAttributeUriForColumn(rowNumber: number): string {
    return `/gdc/md/project_id/obj/attr_${rowNumber}_uri_id`;
}

function generateAttributeDisplayFormUriForColumn(rowNumber: number): string {
    return `${generateAttributeUriForColumn(rowNumber)}_df`;
}

function generateAttributeHeaders(numOfColumns: number): Execution.IAttributeHeader[] {
    return range(numOfColumns).map((columnNumber) => {
        return {
            attributeHeader: {
                uri: generateAttributeDisplayFormUriForColumn(columnNumber),
                identifier: `identifier_${columnNumber}`,
                localIdentifier: `df_local_identifier_${columnNumber}`,
                name: `Column DF ${columnNumber}`,
                formOf: {
                    name: `Column ${columnNumber}`,
                    uri: generateAttributeUriForColumn(columnNumber),
                    identifier: `local_identifier_${columnNumber}`
                }
            }
        };
    });
}

function generateHeaderItems(numOfColumns: number, numOfRows: number): Execution.IResultHeaderItem[][][] {
    return [
        range(numOfColumns).map((columnNumber) => {
            return range(numOfRows).map((rowNumber) => {
                return {
                    attributeHeaderItem: {
                        uri: `${generateAttributeDisplayFormUriForColumn(columnNumber)}/elements?id=${rowNumber}`,
                        name: columnNumber.toString()
                    }
                };
            });
        }),
        [] // empty array => empty 1-st dimension
    ];
}

function generateExecutionResponse(numOfColumns: number): Execution.IExecutionResponse {
    return {
        dimensions: [
            {
                headers: generateAttributeHeaders(numOfColumns)
            },
            {
                headers: [] // empty array => empty 1-st dimension
            }
        ],
        links: {
            executionResult: '/gdc/app/projects/project_id/executionResults/foo?q=bar&c=baz&dimension=a&dimension=m'
        }
    };
}

function generateExecutionResult(numOfColumns: number, numOfRows: number): Execution.IExecutionResult {
    return {
        data: [],
        headerItems: generateHeaderItems(numOfColumns, numOfRows),
        paging: {
            count: [
                20,
                1
            ],
            offset: [
                0,
                0
            ],
            total: [
                20,
                1
            ]
        }
    };
}

function generateTotals(totalsTypes: AFM.TotalType[]): IIndexedTotalItem[] {
    return totalsTypes.map((type, index) => {
        return {
            type,
            alias: index === 0 ? `My ${type}` : undefined,
            outputMeasureIndexes: [index]
        };
    });
}

const tableRenderer = (props: IResponsiveTableProps) => (<ResponsiveTable {...props} rowsPerPage={10} />);

storiesOf('Internal/TableTransformation', module)
    .add('Fixed dimensions', () => (
        screenshotWrap(
            tableWrap(
                <div>
                    <TableTransformation
                        executionRequest={EXECUTION_REQUEST_2A_1M}
                        executionResponse={EXECUTION_RESPONSE_2A_1M}
                        executionResult={EXECUTION_RESULT_2A_1M}
                        height={400}
                        onSortChange={action('Sort changed')}
                        width={600}
                    />
                </div>
            )
        )
    ))
    .add('Fill parent', () => (
        screenshotWrap(
            tableWrap(
                <div style={{ width: '100%', height: 500 }}>
                    <TableTransformation
                        executionRequest={EXECUTION_REQUEST_2A_1M}
                        executionResponse={EXECUTION_RESPONSE_2A_1M}
                        executionResult={EXECUTION_RESULT_2A_1M}
                        onSortChange={action('Sort changed')}
                    />
                </div>
            )
        )
    ))
    .add('Sticky header', () => (
        screenshotWrap(
            tableWrap(
                <div style={{ width: '100%', height: 600 }}>
                    <TableTransformation
                        config={{
                            stickyHeaderOffset: 0
                        }}
                        executionRequest={EXECUTION_REQUEST_2A_1M}
                        executionResponse={EXECUTION_RESPONSE_2A_1M}
                        executionResult={EXECUTION_RESULT_2A_1M}
                        height={400}
                        onSortChange={action('Sort changed')}
                    />
                    <div style={{ height: 800 }} />
                </div>
            )
        )
    ))
    .add('Vertical scroll', () => (
        screenshotWrap(
            tableWrap(
                <div>
                    <TableTransformation
                        executionRequest={generateExecutionRequest()}
                        executionResponse={generateExecutionResponse(20)}
                        executionResult={generateExecutionResult(20, 20)}
                        height={400}
                        onSortChange={action('Sort changed')}
                        width={600}
                    />
                </div>
            )
        )
    ))
    .add('Show more/Show less', () => (
        screenshotWrap(
            tableWrap(
                <TableTransformation
                    config={{
                        onMore: action('More clicked'),
                        onLess: action('Less clicked')
                    }}
                    executionRequest={generateExecutionRequest()}
                    executionResponse={generateExecutionResponse(20)}
                    executionResult={generateExecutionResult(20, 20)}
                    onSortChange={action('Sort changed')}
                    tableRenderer={tableRenderer}
                />
            )
        )
    ))
    .add('Totals view mode', () => (
        screenshotWrap(
            tableWrap(
                <TableTransformation
                    config={{
                        onMore: action('More clicked'),
                        onLess: action('Less clicked'),
                        stickyHeaderOffset: 0
                    }}
                    executionRequest={EXECUTION_REQUEST_2A_3M}
                    executionResponse={EXECUTION_RESPONSE_2A_3M}
                    executionResult={EXECUTION_RESULT_2A_3M}
                    height={400}
                    onSortChange={action('Sort changed')}
                    tableRenderer={tableRenderer}
                    totals={generateTotals(['avg', 'nat', 'sum'])}
                />
            )
        )
    ))
    .add('Totals view mode with German number format', () => (
        screenshotWrap(
            tableWrap(
                <TableTransformation
                    config={{
                        onMore: action('More clicked'),
                        onLess: action('Less clicked'),
                        stickyHeaderOffset: 0,
                        separators: GERMAN_NUMBER_FORMAT
                    }}
                    executionRequest={EXECUTION_REQUEST_2A_3M}
                    executionResponse={EXECUTION_RESPONSE_2A_3M}
                    executionResult={EXECUTION_RESULT_2A_3M}
                    height={400}
                    onSortChange={action('Sort changed')}
                    tableRenderer={tableRenderer}
                    totals={generateTotals(['avg', 'nat', 'sum'])}
                />
            )
        )
    ))
    .add('Totals edit mode', () => {
        let tableRef: any;
        const totals = generateTotals(['avg', 'nat', 'sum']);
        const response = cloneDeep(EXECUTION_RESPONSE_2A_3M);
        // set formatting of third metric - for null display "unknown"
        const header: Execution.IHeader = response.dimensions[1].headers[0];
        if (Execution.isMeasureGroupHeader(header)) {
            header.measureGroupHeader.items[2].measureHeaderItem.format = '[=null][magenta]unknown';
        }
        const onTotalsEdit = (updateTotals: IIndexedTotalItem[]) => {
            action('Totals updated')(updateTotals);
            while (totals.length) {
                totals.pop();
            }
            updateTotals.forEach(t => totals.push(t));
            tableRef.forceUpdate();
        };

        return screenshotWrap(
            tableWrap(
                <TableTransformation
                    ref={(ref) => {
                        tableRef = ref;
                    }}
                    executionRequest={EXECUTION_REQUEST_2A_3M}
                    executionResponse={response}
                    executionResult={EXECUTION_RESULT_2A_3M}
                    height={400}
                    onSortChange={action('Sort changed')}
                    totalsEditAllowed={true}
                    totals={totals}
                    onTotalsEdit={onTotalsEdit}
                />
            )
        );
    });
