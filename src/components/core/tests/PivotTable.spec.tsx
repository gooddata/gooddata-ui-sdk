// (C) 2007-2019 GoodData Corporation
import * as React from 'react';
import { mount, shallow } from 'enzyme';
import { oneAttributeOneMeasureSortByMeasureExecutionObject } from '../../../execution/fixtures/ExecuteAfm.fixtures';
import { IMappingHeader } from '../../../interfaces/MappingHeader';
import { createIntlMock } from '../../visualizations/utils/intlUtils';
import noop = require('lodash/noop');
import cloneDeep = require('lodash/cloneDeep');

import {
    PivotTable,
    PivotTableInner,
    getSortItemByColId,
    getAGGridDataSource,
    RowLoadingElement,
    getDrillRowData,
    getTreeLeaves,
    indexOfTreeNode,
    getDrillIntersection,
    getSortsFromModel,
    IPivotTableInnerProps
} from '../PivotTable';
import {
    oneMeasureDataSource,
    oneAttributeOneMeasureDataSource
} from '../../tests/mocks';
import { pivotTableWithColumnAndRowAttributes } from '../../../../stories/test_data/fixtures';
import { LoadingComponent } from '../../simple/LoadingComponent';
import { executionToAGGridAdapter, getParsedFields } from '../../../helpers/agGrid';
import { ICellRendererParams } from 'ag-grid';
import { GroupingProviderFactory } from '../pivotTable/GroupingProvider';

const intl = createIntlMock();

describe('PivotTable', () => {
    function renderComponent(customProps: Partial<IPivotTableInnerProps> = {}, dataSource = oneMeasureDataSource) {
        return mount(
            <PivotTable
                dataSource={dataSource}
                updateTotals={noop as any}
                getPage={noop as any}
                intl={intl}
                {...customProps}
            />
        );
    }

    it('should render PivotTableInner', () => {
        const wrapper = renderComponent();
        expect(wrapper.find(PivotTableInner)).toHaveLength(1);
    });

    describe('getGridDataSource', () => {
        // tslint:disable-next-line:max-line-length
        it('should return AGGrid dataSource that calls getPage, successCallback, onSuccess, then cancelPagePromises on destroy', async () => {
            const resultSpec = pivotTableWithColumnAndRowAttributes.executionRequest.resultSpec;
            const getPage = jest.fn().mockReturnValue(Promise.resolve(pivotTableWithColumnAndRowAttributes));
            const startRow = 0;
            const endRow = 0;
            const successCallback = jest.fn();
            const cancelPagePromises = jest.fn();
            const onSuccess = jest.fn();
            const getGridApi = () => ({
                setPinnedBottomRowData: jest.fn()
            });
            const sortModel: any[] = [];
            const getExecution = () => pivotTableWithColumnAndRowAttributes;
            const groupingProvider = GroupingProviderFactory.createProvider(true);

            const gridDataSource = getAGGridDataSource(
                resultSpec,
                getPage,
                cancelPagePromises,
                getExecution,
                onSuccess,
                getGridApi,
                intl,
                {},
                [],
                () => groupingProvider
            );
            await gridDataSource.getRows({ startRow, endRow, successCallback, sortModel } as any);
            expect(getPage).toHaveBeenCalledWith(resultSpec, [0, undefined], [0, undefined]);
            expect(successCallback.mock.calls[0]).toMatchSnapshot();
            expect(onSuccess.mock.calls[0]).toMatchSnapshot();

            gridDataSource.destroy();
            expect(cancelPagePromises).toHaveBeenCalledTimes(1);
        });
    });

    describe('RowLoadingElement', () => {
        it('should show LoadingComponent for empty cell', async () => {
            const props: ICellRendererParams = {
                node: {},
                value: 123,
                valueFormatted: noop
            } as any;
            const wrapper = shallow(<RowLoadingElement {...props} />);
            expect(wrapper.find(LoadingComponent)).toHaveLength(1);
        });

        it('should show formatted value for existing data', async () => {
            const props: ICellRendererParams = {
                node: { id: 1 },
                value: Math.PI,
                formatValue: (value: number) => value.toFixed(2)
            } as any;
            const wrapper = shallow(<RowLoadingElement {...props} />);
            expect(wrapper.html()).toEqual('<span>3.14</span>');
        });
    });

    describe('getDrillIntersection', () => {
        const afm = pivotTableWithColumnAndRowAttributes.executionRequest.afm;
        const { columnDefs, rowData } = executionToAGGridAdapter(
            {
                executionResponse: pivotTableWithColumnAndRowAttributes.executionResponse,
                executionResult: pivotTableWithColumnAndRowAttributes.executionResult
            },
            {},
            intl
        );
        it('should return intersection of row attribute and row attribute value for row header cell', async () => {
            const rowColDef = columnDefs[0]; // row header
            const drillItems = [...rowColDef.drillItems, rowData[0].headerItemMap[rowColDef.field]];
            const intersection = getDrillIntersection(drillItems, afm);
            expect(intersection).toEqual([
                {
                    header: {
                        identifier: 'label.restaurantlocation.locationstate',
                        uri: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2211'
                    },
                    id: 'state',
                    title: 'Location State'
                },
                {
                    header: {
                        identifier: '',
                        uri: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210/elements?id=6340109'
                    },
                    id: '',
                    title: 'Alabama'
                }
            ]);
        });

        it(
        'should return intersection of all column header attributes and values and a measure for column header cell',
        async () => {
            const colDef = getTreeLeaves(columnDefs)[3]; // column leaf header
            const intersection = getDrillIntersection(colDef.drillItems, afm);
            expect(intersection).toEqual([
                {
                    header: {
                        identifier: '',
                        uri: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009/elements?id=1'
                    },
                    id: '',
                    title: 'Q1'
                },
                {
                    header: {
                        identifier: 'date.aam81lMifn6q',
                        uri: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2011'
                    },
                    id: 'year',
                    title: 'Quarter (Date)'
                },
                {
                    header: {
                        identifier: '',
                        uri: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071/elements?id=1'
                    },
                    id: '',
                    title: 'Jan'
                },
                {
                    header: {
                        identifier: 'date.abm81lMifn6q',
                        uri: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2073'
                    },
                    id: 'month',
                    title: 'Month (Date)'
                },
                {
                    header: {
                        identifier: 'aabHeqImaK0d',
                        uri: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/6694'
                    },
                    id: 'franchiseFeesAdRoyaltyIdentifier',
                    title: '$ Franchise Fees (Ad Royalty)'
                }
            ]);
        });

        // tslint:disable-next-line:max-line-length
        it('should return intersection without header property when measure has neither uri nor identifier (arithmetic measure)', async () => {
            const drillItems: IMappingHeader[] = [{
                measureHeaderItem: {
                    localIdentifier: 'am1',
                    name: 'Arithmetic measure',
                    format: ''
                }
            }];
            const intersection = getDrillIntersection(drillItems, afm);
            expect(intersection).toEqual([
                {
                    id: 'am1',
                    title: 'Arithmetic measure'
                }
            ]);
        });
    });

    describe('getDrillRowData', () => {
        it('should return an array of row data', async () => {
            const { columnDefs, rowData } = executionToAGGridAdapter(
                {
                    executionResponse: pivotTableWithColumnAndRowAttributes.executionResponse,
                    executionResult: pivotTableWithColumnAndRowAttributes.executionResult
                },
                {},
                intl
            );
            const leafColumnDefs = getTreeLeaves(columnDefs);
            const drillRow = getDrillRowData(leafColumnDefs, rowData[0]);
            expect(drillRow).toEqual([
                {
                  id: '6340109',
                  title: 'Alabama'
                },
                {
                  id: '6340107',
                  title: 'Montgomery'
                },
                '160104.5665',
                '49454.8215',
                '40000',
                '70649.745',
                '156148.86625',
                '47826.00375',
                '40000',
                '68322.8625',
                '154299.8485',
                '47064.6435',
                '40000',
                '67235.205',
                '158572.501',
                '48823.971',
                '40000',
                '69748.53',
                '152789.662',
                '46442.802',
                '40000',
                '66346.86',
                '158587.036',
                '48829.956',
                '40000',
                '69757.08',
                '156553.19425',
                '47992.49175',
                '40000',
                '68560.7025',
                '147504.62125',
                '44266.60875',
                '40000',
                '63238.0125',
                '157944.04075',
                '48565.19325',
                '40000',
                '69378.8475',
                '156878.19175',
                '48126.31425',
                '40000',
                '68751.8775',
                '156446.52775',
                '47948.57025',
                '40000',
                '68497.9575',
                '130719.01675',
                '37354.88925',
                '40000',
                '53364.1275'
            ]);
        });
    });

    describe('groupRows for attribute columns', () => {
        let createProvider: jest.SpyInstance;

        function renderComponentForGrouping(customProps: Partial<IPivotTableInnerProps> = {}) {
            return renderComponent(customProps, oneAttributeOneMeasureDataSource);
        }

        beforeEach(() => {
            createProvider = jest.spyOn(GroupingProviderFactory, 'createProvider');
        });

        afterEach(() => {
            createProvider.mockRestore();
        });

        it.each([
            ['should NOT', undefined, false],
            ['should NOT', false, false]
        ])('%s group rows when groupRows property is %s', (_should, groupRows, expected) => {
            renderComponentForGrouping({
                groupRows
            });

            expect(createProvider).toHaveBeenCalledTimes(1);
            expect(createProvider).toBeCalledWith(expected);
        });

        // tslint:disable-next-line:max-line-length
        it('should group rows when grouping turned on and sorted by first attribute (default sort)', () => {
            renderComponentForGrouping({
                groupRows: true
            });

            expect(createProvider).toHaveBeenCalledTimes(1);
            expect(createProvider).toHaveBeenCalledWith(true);
        });

        it('should NOT group rows when not sorted by first attribute', (done) => {
            // check second async invocation since we are waiting for datasource to be updated with specified resultSpec
            const onDataSourceUpdateSuccess = () => {
                expect(createProvider).toHaveBeenCalledTimes(2);
                expect(createProvider).toHaveBeenNthCalledWith(2, false);
                done();
            };

            renderComponentForGrouping({
                groupRows: true,
                resultSpec: oneAttributeOneMeasureSortByMeasureExecutionObject.execution.resultSpec,
                onDataSourceUpdateSuccess
            });
        });

        it('should NOT group rows when grouping switched by property after render', () => {
            const wrapper = renderComponentForGrouping({
                groupRows: true
            });

            wrapper.setProps({
                groupRows: false
            });

            expect(createProvider).toHaveBeenCalledTimes(2);
            expect(createProvider).toHaveBeenNthCalledWith(2, false);
        });
    });
});

const tree: any = {
    name: 'A',
    children: [
        {
            name: 'A.A'
        },
        {
            name: 'A.B',
            children: [
                {
                    name: 'A.B.A'
                },
                {
                    name: 'A.B.B'
                },
                {
                    name: 'A.B.C'
                }
            ]
        },
        {
            name: 'A.C'
        }
    ]
};

describe('getParsedFields', () => {
    it('should return last parsed field from colId', () => {
        expect(getParsedFields('a_2009')).toEqual([['a', '2009']]);
        expect(getParsedFields('a_2009_4-a_2071_12'))
            .toEqual([['a', '2009', '4'], ['a', '2071', '12']]);
        expect(getParsedFields('a_2009_4-a_2071_12-m_3'))
            .toEqual([['a', '2009', '4'], ['a', '2071', '12'], ['m', '3']]);
    });
});

describe('getSortItemByColId', () => {
    it('should return an attributeSortItem', () => {
        expect(getSortItemByColId(
            pivotTableWithColumnAndRowAttributes,
            'a_2211',
            'asc'
        )).toEqual({ attributeSortItem: { attributeIdentifier: 'state', direction: 'asc' } });
    });
    it('should return a measureSortItem', () => {
        expect(getSortItemByColId(
            pivotTableWithColumnAndRowAttributes,
            'a_2009_1-a_2071_1-m_0',
            'asc'
        )).toEqual({
            measureSortItem: {
                direction: 'asc',
                locators: [
                    {
                        attributeLocatorItem: {
                            attributeIdentifier: 'year',
                            element: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009/elements?id=1'
                        }
                    },
                    {
                        attributeLocatorItem: {
                            attributeIdentifier: 'month',
                            element: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071/elements?id=1'
                        }
                    },
                    {
                        measureLocatorItem: {
                            measureIdentifier: 'franchiseFeesIdentifier'
                        }
                    }
                ]
            }
        });
    });
});

describe('getSortsFromModel', () => {
    it('should return sortItems for row attribute sort', () => {
        const sortModel: any[] = [
            {
                colId: 'a_2211',
                sort: 'asc'
            }
        ];
        expect(getSortsFromModel(sortModel, pivotTableWithColumnAndRowAttributes)).toEqual(
            [{
                attributeSortItem: {
                    attributeIdentifier: 'state',
                    direction: 'asc'
                }
            }]
        );
    });
    it('should return sortItems for measure sort', () => {
        const sortModel: any[] = [
            {
                colId: 'a_2009_1-a_2071_1-m_0',
                sort: 'asc'
            }
        ];
        expect(getSortsFromModel(sortModel, pivotTableWithColumnAndRowAttributes)).toEqual(
            [
                {
                    measureSortItem: {
                        direction: 'asc',
                        locators: [
                            {
                                attributeLocatorItem: {
                                    attributeIdentifier: 'year',
                                    element: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009/elements?id=1'
                                }
                            },
                            {
                                attributeLocatorItem: {
                                    attributeIdentifier: 'month',
                                    element: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071/elements?id=1'
                                }
                            },
                            {
                                measureLocatorItem: {
                                    measureIdentifier: 'franchiseFeesIdentifier'
                                }
                            }
                        ]
                    }
                }
            ]
        );
    });
});

describe('getTreeleaves', () => {
    it('should return tree nodes that have no children', () => {
        expect(getTreeLeaves(tree)).toEqual([
            {
                name: 'A.A'
            },
            {
                name: 'A.C'
            },
            {
                name: 'A.B.A'
            },
            {
                name: 'A.B.B'
            },
            {
                name: 'A.B.C'
            }
        ]);
    });
});

describe('indexOfTreeNode', () => {
    it('should return an array of indexes that define a matiching node in a tree structure', () => {
        const node: any = tree.children[1].children[2];
        expect(indexOfTreeNode(node, tree)).toEqual([0, 1, 2]);
    });
    it('should return indexes with custom matchNode function', () => {
        const clonedTree: any = cloneDeep(tree);
        const node: any = tree.children[1].children[2];
        expect(indexOfTreeNode(
            node,
            clonedTree,
            (nodeA, nodeB) => (nodeA.name && nodeA.name === nodeB.name)
        )).toEqual([0, 1, 2]);
    });
    it('should return return null if the node is not found', () => {
        const node = {};
        expect(indexOfTreeNode(node, tree)).toEqual(null);
    });
});
