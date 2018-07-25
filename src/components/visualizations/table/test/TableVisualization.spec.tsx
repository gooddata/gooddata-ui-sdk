// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { Table } from 'fixed-data-table-2';
// tslint:disable-next-line:no-implicit-dependencies
import * as Portal from 'react-portal';
import { AFM } from '@gooddata/typings';
import { testUtils } from '@gooddata/js-utils';
import 'jest';

import {
    TableVisualization,
    DEFAULT_FOOTER_ROW_HEIGHT,
    ITableVisualizationProps,
    ITableVisualizationState
} from '../TableVisualization';
import { TableHeader, TableRow } from '../../../../interfaces/Table';
import { ASC, DESC } from '../../../../constants/sort';
import { EXECUTION_REQUEST_1A_2M, TABLE_HEADERS_1A_2M, TABLE_ROWS_1A_2M } from '../fixtures/1attribute2measures';
import { EXECUTION_REQUEST_2M, TABLE_HEADERS_2M, TABLE_ROWS_2M } from '../fixtures/2measures';
import { RemoveRows } from '../totals/RemoveRows';
import { EXECUTION_REQUEST_2A_3M, TABLE_HEADERS_2A_3M, TABLE_ROWS_2A_3M } from '../fixtures/2attributes3measures';
import { TotalCell } from '../totals/TotalCell';
import InjectedIntlProps = ReactIntl.InjectedIntlProps;
import { ITotalWithData } from '../../../../interfaces/Totals';
import { withIntl, wrapWithIntl } from '../../utils/intlUtils';

function getInstanceFromWrapper(wrapper: ReactWrapper<any>, component: any): any {
    return wrapper.find(component).childAt(0).instance();
}

function createPortalWrapper(tableWrapper: ReactWrapper<any>): ReactWrapper<any> {
    const portalInstance = tableWrapper.find(Portal).at(0).instance();
    return new ReactWrapper(wrapWithIntl(portalInstance.props.children));
}

const WrappedTable: React.ComponentClass<ITableVisualizationProps> = withIntl(
    TableVisualization
);

describe('Table', () => {
    function renderTable(customProps: Partial<ITableVisualizationProps> = {}):
        ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> {
        const props: ITableVisualizationProps = {
            containerWidth: 600,
            containerHeight: 400,
            rows: TABLE_ROWS_1A_2M,
            headers: TABLE_HEADERS_1A_2M,
            executionRequest: EXECUTION_REQUEST_1A_2M,
            ...customProps
        };

        return mount(
            <WrappedTable {...props} />
        );
    }

    it('should fit container dimensions', () => {
        const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
            renderTable();
        expect(wrapper.find(Table).prop('width')).toEqual(600);
        expect(wrapper.find(Table).prop('maxHeight')).toEqual(400);
    });

    it('should sort by clicking on button in tooltip', () => {
        const onSortChange = jest.fn();
        const wrapper =
            renderTable({
                sortInTooltip: true,
                onSortChange
            });

        const header = wrapper.find('.gd-table-header-ordering').at(0);
        header.simulate('click');
        return testUtils.delay().then(() => {
            expect(onSortChange).toHaveBeenCalledTimes(0);
            const portalWrapper = createPortalWrapper(wrapper);
            const btn = portalWrapper.find('.button-sort-asc');
            btn.simulate('click');
            expect(onSortChange).toHaveBeenCalledTimes(1);
        });
    });

    it('should render column headers', () => {
        const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
            renderTable();
        expect(wrapper.find(Table).prop('children')).toHaveLength(3);
    });

    it('should align measure columns to the right', () => {
        const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
            renderTable();
        const columns = wrapper.find(Table).prop('children');
        expect(columns[0].props.align).toEqual('left');
        expect(columns[1].props.align).toEqual('right');
        expect(columns[2].props.align).toEqual('right');
    });

    it('should distribute width evenly between columns', () => {
        const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
            renderTable();
        const columns = wrapper.find(Table).prop('children');
        expect(columns[0].props.width).toEqual(200);
    });

    describe('renderers', () => {
        function renderCell(
            wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState>,
            columnKey: number
        ): JSX.Element {
            const columns = wrapper.find(Table).prop('children');
            const cell = columns[columnKey].props.cell({ rowIndex: 0, columnKey });
            return cell.props.children;
        }

        it('should format measures', () => {
            const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                renderTable();
            const span: JSX.Element = renderCell(wrapper, 2);
            const spanContent: string = span.props.children;
            expect(spanContent).toEqual('1,324');
            expect(span.props.style.color).toEqual('#FF0000');
        });

        it('should render attributes as strings', () => {
            const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                renderTable();
            const span = renderCell(wrapper, 0);
            const spanContent = span.props.children;
            expect(spanContent).toEqual('Wile E. Coyote');
            expect(span.props.style).toEqual({});
        });

        it('should render title into header', () => {
            const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                renderTable();
            expect(wrapper.find('.gd-table-header-title').first().text()).toEqual('Name');
        });

        it('should bind onclick when cell drillable', () => {
            const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                renderTable({ drillableItems: [{ uri: '/gdc/md/project_id/obj/1st_measure_uri_id' }] });
            const columns = wrapper.find(Table).prop('children');
            const cell = columns[1].props.cell({ rowIndex: 0, columnKey: 1 });

            expect(cell.props).toHaveProperty('onClick', expect.any(Function));
        });

        it('should not bind onclick when cell not drillable', () => {
            const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                renderTable({ drillableItems: [{ uri: '/gdc/md/project_id/obj/unknown_measure_uri_id' }] });
            const columns = wrapper.find(Table).prop('children');
            const cell = columns[1].props.cell({ rowIndex: 0, columnKey: 1 });
            expect(cell.props).not.toHaveProperty('onClick', expect.any(Function));
        });
    });

    describe('sort', () => {
        describe('default header renderer', () => {
            it('should render up arrow', () => {
                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable({ sortBy: 0, sortDir: ASC });
                const columns = wrapper.find(Table).prop('children');
                const header = columns[0].props.header({ columnKey: 0 });
                const sort = header.props.children[1];

                expect(sort.props.className).toContain('gd-table-arrow-up');
                expect(sort.props.className).toContain('s-sorted-asc');
            });

            it('should render down arrow', () => {
                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable({ sortBy: 0, sortDir: DESC });
                const columns = wrapper.find(Table).prop('children');
                const header = columns[0].props.header({ columnKey: 0 });
                const sort = header.props.children[1];

                expect(sort.props.className).toContain('gd-table-arrow-down');
                expect(sort.props.className).toContain('s-sorted-desc');
            });

            it('should render arrow on second column', () => {
                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable({ sortBy: 1, sortDir: ASC });
                const columns = wrapper.find(Table).prop('children');
                const header = columns[1].props.header({ columnKey: 0 });
                const sort = header.props.children[1];

                expect(sort.props.className).toContain('gd-table-arrow-up');
                expect(sort.props.className).toContain('s-sorted-asc');
            });

            it('should not render arrow if sort info is missing', () => {
                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable({ sortBy: 0, sortDir: null });
                const columns = wrapper.find(Table).prop('children');
                const header = columns[0].props.header({ columnKey: 0 });
                const sort = header.props.children[1];

                expect(sort.props.className).toEqual('');
            });
        });

        describe('tooltip header renderer', () => {
            it('should render title into header', () => {
                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable({ sortInTooltip: true });

                wrapper.find('.gd-table-header-title').first().simulate('click');

                const bubble = document.querySelector('.gd-table-header-bubble');
                expect(bubble).toBeDefined();

                // work-around to handle overlays
                document.body.innerHTML = '';
            });
        });
    });

    describe('table footer and totals', () => {
        const TOTALS: ITotalWithData[] = [
            {
                type: 'sum',
                values: [null, null, 125],
                outputMeasureIndexes: []
            }, {
                type: 'avg',
                values: [null, 45.98, 12.32],
                outputMeasureIndexes: []
            }, {
                type: 'nat',
                values: [null, 12.99, 1.008],
                outputMeasureIndexes: []
            }
        ];

        const DATA_2A_3M: {
            rows: TableRow[];
            headers: TableHeader[];
            executionRequest: AFM.IExecution;
        } = {
            rows: TABLE_ROWS_2A_3M,
            headers: TABLE_HEADERS_2A_3M,
            executionRequest: EXECUTION_REQUEST_2A_3M
        };

        describe('totals edit not allowed', () => {
            it('should not has footer when no totals provided', () => {
                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable({
                    ...DATA_2A_3M
                });
                const component: any = wrapper.find(TableVisualization).childAt(0).instance();

                expect(component.hasFooterWithTotals()).toBeFalsy();
            });

            it('should has footer when some totals provided', () => {
                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable({
                    totalsWithData: TOTALS,
                    ...DATA_2A_3M
                });
                const component: any = wrapper.find(TableVisualization).childAt(0).instance();

                expect(component.hasFooterWithTotals()).toBeTruthy();
            });

            it('should render total cells when totals are provided', () => {
                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable({
                    totalsWithData: TOTALS,
                    ...DATA_2A_3M
                });

                expect(wrapper.find(TotalCell).length).toEqual(5);
            });

            it('should not render any footer cells when no totals are provided', () => {
                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable(DATA_2A_3M);

                expect(wrapper.find('.indigo-table-footer-cell').length).toEqual(0);
            });

            it('should not render any total cell when totals are provided but data contains only measures', () => {
                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable({
                    totalsWithData: TOTALS,
                    headers: TABLE_HEADERS_2M,
                    rows: TABLE_ROWS_2M,
                    executionRequest: EXECUTION_REQUEST_2M
                });

                expect(wrapper.find(TotalCell).length).toEqual(0);
            });

            it('should not render total cell when totals are provided and there is only row in data', () => {
                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable({
                    totalsWithData: TOTALS,
                    rows: TABLE_ROWS_1A_2M,
                    headers: TABLE_HEADERS_1A_2M,
                    executionRequest: EXECUTION_REQUEST_1A_2M
                });

                expect(wrapper.find(TotalCell).length).toEqual(3);
            });

            it('should reset footer when component is updated with no totals', () => {
                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable({
                    totalsWithData: TOTALS,
                    ...DATA_2A_3M
                });

                const { footer } = getInstanceFromWrapper(wrapper, TableVisualization);

                expect(footer.classList.contains('table-footer')).toBeTruthy();

                wrapper.setProps({ totalsWithData: [] });

                expect(footer.classList.contains('table-footer')).toBeFalsy();
            });

            it('should update footer height when component is updated with different totals', () => {
                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable({
                    totalsWithData: TOTALS,
                    ...DATA_2A_3M
                });
                const { footer } = getInstanceFromWrapper(wrapper, TableVisualization);

                const heightBefore: number = TOTALS.length * DEFAULT_FOOTER_ROW_HEIGHT;

                expect(footer.style.height).toEqual(`${heightBefore}px`);

                const totalsAfter: ITotalWithData[] = [
                    ...TOTALS,
                    {
                        type: 'min',
                        outputMeasureIndexes: [],
                        values: [1, 2, 3]
                    }
                ];

                const heightAfter: number = totalsAfter.length * DEFAULT_FOOTER_ROW_HEIGHT;

                wrapper.setProps({ totalsWithData: totalsAfter });

                expect(footer.style.height).toEqual(`${heightAfter}px`);
            });
        });

        describe('totals edit allowed', () => {
            it('should has footer even when no totals defined', () => {
                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable({
                    totalsEditAllowed: true,
                    ...DATA_2A_3M
                });
                const component: any = wrapper.find(TableVisualization).childAt(0).instance();

                expect(component.hasFooterWithTotals()).toBeTruthy();
            });

            it('should set editable class name to table', () => {
                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable({
                    totalsEditAllowed: true,
                    ...DATA_2A_3M
                });

                expect(wrapper.find('.indigo-table-component.has-footer-editable').length).toEqual(1);
            });

            it('should render remove buttons block when totals are provided', () => {
                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable({
                    totalsWithData: TOTALS,
                    totalsEditAllowed: true,
                    ...DATA_2A_3M
                });

                expect(wrapper.find(RemoveRows).length).toEqual(1);
            });

            it('should bind mouse events on table body cells', () => {
                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable({
                    totalsWithData: TOTALS,
                    totalsEditAllowed: true,
                    ...DATA_2A_3M
                });
                const component: any = wrapper.find(TableVisualization).childAt(0).instance();
                const cell = wrapper.find('.fixedDataTableCellLayout_wrap1.col-2').at(0);

                component.toggleFooterColumnHighlight = jest.fn();

                cell.simulate('mouseOver');

                expect(component.toggleFooterColumnHighlight).toBeCalledWith(2, true);

                cell.simulate('mouseLeave');

                expect(component.toggleFooterColumnHighlight).toBeCalledWith(2, false);
            });

            it('should enable total column when new row added', () => {
                const onTotalsEdit = jest.fn();

                const wrapper: ReactWrapper<ITableVisualizationProps & InjectedIntlProps, ITableVisualizationState> =
                    renderTable({
                        totalsEditAllowed: true,
                        onTotalsEdit,
                        ...DATA_2A_3M
                    });

                const component: any = wrapper.find(TableVisualization).childAt(0).instance();

                component.addTotalsRow(2, 'sum');

                expect(onTotalsEdit).toBeCalledWith([{
                    type: 'sum',
                    outputMeasureIndexes: [0]
                }]);
            });
        });
    });
});
