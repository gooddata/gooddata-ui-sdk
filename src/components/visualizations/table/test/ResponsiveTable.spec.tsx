// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { noop, range } from 'lodash';
import { AFM } from '@gooddata/typings';

import { withIntl } from '../../utils/intlUtils';
import { TableHeader, TableRow } from '../../../../interfaces/Table';
import { ITotalWithData } from '../../../../interfaces/Totals';
import { IResponsiveTableProps, IResponsiveTableState, ResponsiveTable } from '../ResponsiveTable';
import { Table } from '../Table';

import { EXECUTION_REQUEST_1A_2M, TABLE_HEADERS_1A_2M, TABLE_ROWS_1A_2M } from '../fixtures/1attribute2measures';
import 'jest';

const ROWS_PER_PAGE: number = 10;
const WrappedTable: React.ComponentClass<IResponsiveTableProps> = withIntl(ResponsiveTable);

const getMore = (wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState>) => wrapper.find('.s-show_more');
const getLess = (wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState>) => wrapper.find('.s-show_less');

interface ITableData {
    executionRequest: AFM.IExecution;
    headers: TableHeader[];
    rows: TableRow[];
    totalsWithData?: ITotalWithData[];
}

describe('Responsive Table', () => {
    const TABLE_DATA: ITableData = {
        executionRequest: EXECUTION_REQUEST_1A_2M,
        headers: TABLE_HEADERS_1A_2M,
        rows: TABLE_ROWS_1A_2M
    };

    function renderTable(tableData: ITableData, customProps: Partial<IResponsiveTableProps> = {}):
        ReactWrapper<IResponsiveTableProps, IResponsiveTableState> {
        const props: Partial<IResponsiveTableProps> = {
            onMore: noop,
            onLess: noop,
            ...customProps
        };

        return mount(
            <WrappedTable
                rowsPerPage={ROWS_PER_PAGE}
                {...props}
                {...tableData}
            />
        );
    }

    describe('proportions', () => {
        it('should compute table height using data and total rows count', () => {
            const tableDataWithTotals: ITableData = {
                ...TABLE_DATA,
                totalsWithData: [{
                    type: 'sum',
                    outputMeasureIndexes: [],
                    values: []
                }]
            };
            const wrapper = renderTable(tableDataWithTotals);
            const componentInstance = wrapper.find(Table).instance();
            expect(componentInstance.props.containerHeight).toEqual(106);
        });
    });

    describe('page', () => {
        it('should set new page when it is sent in props', () => {
            const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = renderTable(TABLE_DATA);
            expect(wrapper.find(Table).prop('page')).toEqual(1);
            wrapper.setProps({ page: 2 });
            expect(wrapper.find(Table).prop('page')).toEqual(2);
        });
    });

    describe('when data contains less than 1 page of rows', () => {
        it('should not show "More" button', () => {
            const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = renderTable(TABLE_DATA);
            expect(getMore(wrapper)).toHaveLength(0);
        });

        it('should not show "Less" button', () => {
            const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = renderTable(TABLE_DATA);
            expect(getLess(wrapper)).toHaveLength(0);
        });

        it('should set correct number of rows', () => {
            const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = renderTable(TABLE_DATA);
            expect(wrapper.find(Table).prop('rows').length).toEqual(1);
        });
    });

    describe('when data contains more than 1 page of rows', () => {
        const tableData: ITableData = {
            executionRequest: EXECUTION_REQUEST_1A_2M,
            headers: TABLE_HEADERS_1A_2M,
            rows: range(0, 25).map(() => TABLE_ROWS_1A_2M[0])
        };

        describe('and table is showing first page', () => {
            it('should show "More" button', () => {
                const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = renderTable(tableData);
                expect(getMore(wrapper)).toHaveLength(1);
            });

            it('should not show "Less" button', () => {
                const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = renderTable(tableData);
                expect(getLess(wrapper)).toHaveLength(0);
            });

            it('should set correct number of rows', () => {
                const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = renderTable(tableData);
                expect(wrapper.find(Table).prop('rows').length).toEqual(ROWS_PER_PAGE);
            });

            it('should call onMore callback with number of rows and page when user clicks "More"', () => {
                const onMore = jest.fn();
                const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = renderTable(
                    tableData, { onMore }
                );
                getMore(wrapper).simulate('click');
                expect(onMore).toBeCalledWith({
                    rows: ROWS_PER_PAGE * 2,
                    page: 2
                });
            });
        });

        describe('and table is showing some page', () => {
            function prepareComponent(props = {}) {
                const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = renderTable(
                    tableData, props
                );
                getMore(wrapper).simulate('click');
                return wrapper;
            }

            it('should show "Less" button', () => {
                const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = prepareComponent();
                expect(getLess(wrapper)).toHaveLength(1);
            });

            it('should set correct number of rows', () => {
                const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = prepareComponent();
                expect(wrapper.find(Table).prop('rows').length).toEqual(ROWS_PER_PAGE * 2);
            });

            it('should return to first page when user clicks "Less"', () => {
                const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = prepareComponent();
                getLess(wrapper).simulate('click');
                expect(wrapper.find(Table).prop('rows').length).toEqual(ROWS_PER_PAGE);
            });

            it('should call onLess callback with number of rows when user clicks "Less"', () => {
                const onLess = jest.fn();
                const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = prepareComponent(
                    { onLess }
                );
                getLess(wrapper).simulate('click');
                expect(onLess).toBeCalledWith({ rows: ROWS_PER_PAGE });
            });
        });

        describe('and table is showing last page', () => {
            function prepareComponent(props = {}) {
                const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = renderTable(
                    tableData, props
                );
                getMore(wrapper).simulate('click');
                getMore(wrapper).simulate('click');
                return wrapper;
            }

            it('should hide "More" button', () => {
                const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = prepareComponent();
                expect(getMore(wrapper)).toHaveLength(0);
            });

            it('should show "Less" button', () => {
                const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = prepareComponent();
                expect(getLess(wrapper)).toHaveLength(1);
            });

            it('should set correct number of rows', () => {
                const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = prepareComponent();
                expect(wrapper.find(Table).prop('rows').length).toEqual(25);
            });

            it('should return to first page when user clicks "Less"', () => {
                const wrapper: ReactWrapper<IResponsiveTableProps, IResponsiveTableState> = prepareComponent();
                getLess(wrapper).simulate('click');
                expect(wrapper.find(Table).prop('rows').length).toEqual(ROWS_PER_PAGE);
            });
        });
    });
});
