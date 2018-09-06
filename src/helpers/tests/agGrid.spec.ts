// (C) 2007-2018 GoodData Corporation
import {
    getIdsFromUri,
    identifyHeader,
    identifyResponseHeader,
    headerToGrid,
    getColumnHeaders,
    getRowHeaders,
    getFields,
    getRow,
    getMinimalRowData,
    assortDimensionHeaders,
    assignSorting,
    executionToAGGridAdapter,
    sanitizeField,
    getMeasureDrillItem,
    assignDrillItemsAndType,
    getAttributeSortItemFieldAndDirection,
    getMeasureSortItemFieldAndDirection
} from '../agGrid';

import * as fixtures from '../../../stories/test_data/fixtures';
import { Execution, AFM } from '@gooddata/typings';
import { IDrillItem } from '../../interfaces/DrillEvents';
import { IGridHeader } from '../../interfaces/AGGrid';

describe('getIdsFromUri', () => {
    it('should return array of attribute id and attribute value id', () => {
        expect(getIdsFromUri('/gdc/md/storybook/obj/123/elements?id=456'))
            .toEqual(['123', '456']);
    });
    it('should return null as attribute value id if supplied with attribute uri', () => {
        expect(getIdsFromUri('/gdc/md/storybook/obj/123'))
            .toEqual(['123', null]);
    });
    it('should work with non standard ids and sanitize them', () => {
        expect(getIdsFromUri('/gdc/md/storybook/obj/123_ABC.DEF/elements?id=456_GHI.789'))
            .toEqual(['123UNDERSCOREABCDOTDEF', '456UNDERSCOREGHIDOT789']);
    });
    it('should return unsanitized ids if sanitize: false', () => {
        expect(getIdsFromUri('/gdc/md/storybook/obj/123_ABC.DEF/elements?id=456_GHI.789', false))
            .toEqual(['123_ABC.DEF', '456_GHI.789']);
    });
});
describe('identifyHeader', () => {
    it('should return correct field key for an attribute header', () => {
        expect(
            identifyHeader(fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[0][0][0])
        ).toBe('a_2210_6340109');
    });

    it('should return correct field key for a measure header', () => {
        expect(
            identifyHeader(fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[1][2][0])
        ).toBe('m_0');
    });
});
describe('identifyResponseHeader', () => {
    it('should return correct field key for an attribute response header', () => {
        expect(
            identifyResponseHeader(
                fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions[0].headers[0]
            )
        ).toBe('a_2211');
    });
});

describe('headerToGrid', () => {
    it('should return correct grid header for an attribute header with correct prefix', () => {
        expect(
            headerToGrid(fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[0][0][0], 'prefix_')
        ).toEqual({ field: 'prefix_a_2210_6340109', headerName: 'Alabama' });
    });

    it('should return correct grid header for a measure header with correct prefix', () => {
        expect(
            headerToGrid(fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[1][2][0], 'prefix_')
        ).toEqual({ field: 'prefix_m_0', headerName: '$ Franchise Fees' });
    });
});

describe('getColumnHeaders', () => {
    it('should return hierarchical column headers', () => {
        expect(
            getColumnHeaders(
                fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[1],
                fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions[1].headers
            )
        ).toMatchSnapshot();
    });
});

describe('getRowHeaders', () => {
    it('should return an array of grid headers', () => {
        expect(
            getRowHeaders(
                fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions[0].headers,
                {},
                false
            )
        ).toEqual(
            [
                {
                    field: 'a_2211',
                    headerName: 'Location State',
                    type: 'ROW_ATTRIBUTE_COLUMN',
                    drillItems: [
                        {
                            identifier: 'label.restaurantlocation.locationstate',
                            localIdentifier: 'state',
                            title: 'Location State',
                            uri: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2211'
                        }
                    ]
                },
                {
                    field: 'a_2205',
                    headerName: 'Location Name',
                    type: 'ROW_ATTRIBUTE_COLUMN',
                    drillItems: [{
                        identifier: 'label.restaurantlocation.locationname',
                        localIdentifier: 'location',
                        title: 'Location Name',
                        uri: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2205'
                    }]
                }
            ]
        );
    });
    it('should return an array of grid headers with row group settings and extended by custom options', () => {
        expect(
            getRowHeaders(
                fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions[0].headers,
                { type: 'custom' },
                true
            )
        ).toEqual(
            [
                {
                    field: 'a_2211',
                    headerName: 'Location State',
                    hide: true,
                    rowGroup: true,
                    type: 'custom',
                    drillItems: [
                        {
                            identifier: 'label.restaurantlocation.locationstate',
                            localIdentifier: 'state',
                            title: 'Location State',
                            uri: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2211'
                        }
                    ]
                },
                {
                    field: 'a_2205',
                    headerName: 'Location Name',
                    hide: true,
                    rowGroup: true,
                    type: 'custom',
                    drillItems: [
                        {
                            identifier: 'label.restaurantlocation.locationname',
                            localIdentifier: 'location',
                            title: 'Location Name',
                            uri: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2205'
                        }
                    ]
                }
            ]
        );
    });
});

describe('getFields', () => {
    it('should return an array of all column fields', () => {
        expect(
            getFields(fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[1])
        ).toEqual(
            [
                'a_2009_1-a_2071_1-m_0',
                'a_2009_1-a_2071_1-m_1',
                'a_2009_1-a_2071_1-m_2',
                'a_2009_1-a_2071_1-m_3',
                'a_2009_1-a_2071_2-m_0',
                'a_2009_1-a_2071_2-m_1',
                'a_2009_1-a_2071_2-m_2',
                'a_2009_1-a_2071_2-m_3',
                'a_2009_1-a_2071_3-m_0',
                'a_2009_1-a_2071_3-m_1',
                'a_2009_1-a_2071_3-m_2',
                'a_2009_1-a_2071_3-m_3',
                'a_2009_2-a_2071_4-m_0',
                'a_2009_2-a_2071_4-m_1',
                'a_2009_2-a_2071_4-m_2',
                'a_2009_2-a_2071_4-m_3',
                'a_2009_2-a_2071_5-m_0',
                'a_2009_2-a_2071_5-m_1',
                'a_2009_2-a_2071_5-m_2',
                'a_2009_2-a_2071_5-m_3',
                'a_2009_2-a_2071_6-m_0',
                'a_2009_2-a_2071_6-m_1',
                'a_2009_2-a_2071_6-m_2',
                'a_2009_2-a_2071_6-m_3',
                'a_2009_3-a_2071_7-m_0',
                'a_2009_3-a_2071_7-m_1',
                'a_2009_3-a_2071_7-m_2',
                'a_2009_3-a_2071_7-m_3',
                'a_2009_3-a_2071_8-m_0',
                'a_2009_3-a_2071_8-m_1',
                'a_2009_3-a_2071_8-m_2',
                'a_2009_3-a_2071_8-m_3',
                'a_2009_3-a_2071_9-m_0',
                'a_2009_3-a_2071_9-m_1',
                'a_2009_3-a_2071_9-m_2',
                'a_2009_3-a_2071_9-m_3',
                'a_2009_4-a_2071_10-m_0',
                'a_2009_4-a_2071_10-m_1',
                'a_2009_4-a_2071_10-m_2',
                'a_2009_4-a_2071_10-m_3',
                'a_2009_4-a_2071_11-m_0',
                'a_2009_4-a_2071_11-m_1',
                'a_2009_4-a_2071_11-m_2',
                'a_2009_4-a_2071_11-m_3',
                'a_2009_4-a_2071_12-m_0',
                'a_2009_4-a_2071_12-m_1',
                'a_2009_4-a_2071_12-m_2',
                'a_2009_4-a_2071_12-m_3'
            ]
        );
    });
});

describe('getRow', () => {
    it('should return a grid row', () => {
        const headerItems = fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems;
        const rowHeaders = getRowHeaders(
            fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions[0].headers,
            {},
            false
        );

        const columnFields: string[] = getFields(headerItems[1]);

        expect(
            getRow(
                fixtures.pivotTableWithColumnAndRowAttributes.executionResult.data[0],
                0,
                columnFields,
                rowHeaders,
                headerItems[0]
            )
        ).toEqual({
            'a_2009_1-a_2071_1-m_0': '160104.5665',
            'a_2009_1-a_2071_1-m_1': '49454.8215',
            'a_2009_1-a_2071_1-m_2': '40000',
            'a_2009_1-a_2071_1-m_3': '70649.745',
            'a_2009_1-a_2071_2-m_0': '156148.86625',
            'a_2009_1-a_2071_2-m_1': '47826.00375',
            'a_2009_1-a_2071_2-m_2': '40000',
            'a_2009_1-a_2071_2-m_3': '68322.8625',
            'a_2009_1-a_2071_3-m_0': '154299.8485',
            'a_2009_1-a_2071_3-m_1': '47064.6435',
            'a_2009_1-a_2071_3-m_2': '40000',
            'a_2009_1-a_2071_3-m_3': '67235.205',
            'a_2009_2-a_2071_4-m_0': '158572.501',
            'a_2009_2-a_2071_4-m_1': '48823.971',
            'a_2009_2-a_2071_4-m_2': '40000',
            'a_2009_2-a_2071_4-m_3': '69748.53',
            'a_2009_2-a_2071_5-m_0': '152789.662',
            'a_2009_2-a_2071_5-m_1': '46442.802',
            'a_2009_2-a_2071_5-m_2': '40000',
            'a_2009_2-a_2071_5-m_3': '66346.86',
            'a_2009_2-a_2071_6-m_0': '158587.036',
            'a_2009_2-a_2071_6-m_1': '48829.956',
            'a_2009_2-a_2071_6-m_2': '40000',
            'a_2009_2-a_2071_6-m_3': '69757.08',
            'a_2009_3-a_2071_7-m_0': '156553.19425',
            'a_2009_3-a_2071_7-m_1': '47992.49175',
            'a_2009_3-a_2071_7-m_2': '40000',
            'a_2009_3-a_2071_7-m_3': '68560.7025',
            'a_2009_3-a_2071_8-m_0': '147504.62125',
            'a_2009_3-a_2071_8-m_1': '44266.60875',
            'a_2009_3-a_2071_8-m_2': '40000',
            'a_2009_3-a_2071_8-m_3': '63238.0125',
            'a_2009_3-a_2071_9-m_0': '157944.04075',
            'a_2009_3-a_2071_9-m_1': '48565.19325',
            'a_2009_3-a_2071_9-m_2': '40000',
            'a_2009_3-a_2071_9-m_3': '69378.8475',
            'a_2009_4-a_2071_10-m_0': '156878.19175',
            'a_2009_4-a_2071_10-m_1': '48126.31425',
            'a_2009_4-a_2071_10-m_2': '40000',
            'a_2009_4-a_2071_10-m_3': '68751.8775',
            'a_2009_4-a_2071_11-m_0': '156446.52775',
            'a_2009_4-a_2071_11-m_1': '47948.57025',
            'a_2009_4-a_2071_11-m_2': '40000',
            'a_2009_4-a_2071_11-m_3': '68497.9575',
            'a_2009_4-a_2071_12-m_0': '130719.01675',
            'a_2009_4-a_2071_12-m_1': '37354.88925',
            'a_2009_4-a_2071_12-m_2': '40000',
            'a_2009_4-a_2071_12-m_3': '53364.1275',
            'a_2205': 'Montgomery',
            'a_2211': 'Alabama',
            'drillItemMap': {
                a_2205: {
                    title: 'Montgomery',
                    uri: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2204/elements?id=6340107'
                },
                a_2211: {
                    title: 'Alabama',
                    uri: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210/elements?id=6340109'
                }
            }
        });
    });
});

describe('getMinimalRowData', () => {
    it('should return a two-dimensional array of empty values when no measure data are available', () => {
        expect(
            getMinimalRowData(
                [],
                fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[0]
            )
        ).toEqual([
            [null],
            [null],
            [null],
            [null],
            [null],
            [null]
        ]);
    });

    it('should return a identical data if measure data is available', () => {
        const data = [[1], [2], [3]];
        expect(
            getMinimalRowData(
                data,
                fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[0]
            )
        ).toBe(data);
    });
});

describe('assortDimensionHeaders', () => {
    it('should return attribute and measure dimension headers', () => {
        const dimensions = fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions;
        const { attributeHeaders, measureHeaderItems } = assortDimensionHeaders(dimensions);
        expect(attributeHeaders).toHaveLength(4);
        expect(attributeHeaders.filter(header => Execution.isAttributeHeader(header))).toHaveLength(4);
        expect(measureHeaderItems).toHaveLength(4);
        expect(measureHeaderItems.filter(header => header.hasOwnProperty('measureHeaderItem'))).toHaveLength(4);
    });
});

describe('getAttributeSortItemFieldAndDirection', () => {
    const dimensions = fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions;
    const { attributeHeaders } = assortDimensionHeaders(dimensions);
    const attributeSortItem: AFM.IAttributeSortItem = {
        attributeSortItem: {
            direction: 'asc',
            attributeIdentifier: 'state'
        }
    };
    it('should return matching key and direction from attributeHeaders', () => {
        expect(getAttributeSortItemFieldAndDirection(attributeSortItem, attributeHeaders))
            .toEqual(['a_2211', 'asc' ]);
    });
});

describe('getMeasureSortItemFieldAndDirection', () => {
    const dimensions = fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions;
    const { measureHeaderItems } = assortDimensionHeaders(dimensions);
    const measureSortItem: AFM.IMeasureSortItem = {
        measureSortItem: {
            direction: 'desc',
            locators: [
                {
                    attributeLocatorItem: {
                        attributeIdentifier: 'date.aam81lMifn6q',
                        element: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009/elements?id=1'
                    }
                },
                {
                    attributeLocatorItem: {
                        attributeIdentifier: 'date.abm81lMifn6q',
                        element: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071/elements?id=1'
                    }
                },
                {
                    measureLocatorItem: {
                        measureIdentifier: 'aaEGaXAEgB7U'
                    }
                }
            ]
        }
    };
    it('should return matching key and direction from attributeHeaders', () => {
        expect(getMeasureSortItemFieldAndDirection(measureSortItem, measureHeaderItems))
            .toEqual(['a_2009_1-a_2071_1-m_-1', 'desc' ]);
    });
});

describe('assignSorting', () => {
    const ASC = 'asc';
    const sortingMap = { a_1234: ASC };
    it('should assign sort property to the colDef with matching field', () => {
        const colDef = { field: 'a_1234' };
        assignSorting(colDef, sortingMap);
        expect(colDef).toEqual({ field: 'a_1234', sort: 'asc' });
    });
    it('should return identical', () => {
        const colDef = { field: 'a_5678' };
        assignSorting(colDef, sortingMap);
        expect(colDef).toEqual({ field: 'a_5678' });
    });
});

describe('executionToAGGridAdapter', () => {
    it('should return grid data for executionResult', () => {
        expect(
            executionToAGGridAdapter({
                executionResponse: fixtures.pivotTableWithColumnAndRowAttributes.executionResponse,
                executionResult: fixtures.pivotTableWithColumnAndRowAttributes.executionResult
            })
        ).toMatchSnapshot();
    });
    it('should return grid data for executionResult with rowGroups and loadingRenderer', () => {
        expect(
            executionToAGGridAdapter({
                executionResponse: fixtures.barChartWithStackByAndOnlyOneStack.executionResponse,
                executionResult: fixtures.barChartWithStackByAndOnlyOneStack.executionResult
            })
        ).toMatchSnapshot();
    });
});

describe('sanitizeField', () => {
    it('should replace [.], [_] and [-] characters with placeholders', () => {
        expect(
            sanitizeField('field.with-replacement_')
        ).toBe('fieldDOTwithDASHreplacementUNDERSCORE');
    });
});

describe('getMeasureDrillItem', () => {
    it('should return measure drill item based on response headers', () => {
        const responseHeaders: Execution.IHeader[]
            = fixtures.barChartWithStackByAndOnlyOneStack.executionResponse.dimensions[1].headers;
        const header: Execution.IResultMeasureHeaderItem = { measureHeaderItem: { name: 'not important', order: 0 } };
        expect(
            getMeasureDrillItem(responseHeaders, header)
        ).toEqual({
            identifier: 'ah1EuQxwaCqs',
            localIdentifier: 'amountMetric',
            title: 'Amount',
            uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1279'
        });
    });
    it('should return null if the header cannot be found', () => {
        const responseHeaders1: Execution.IHeader[]
            = fixtures.barChartWithStackByAndOnlyOneStack.executionResponse.dimensions[0].headers;
        const responseHeaders2: Execution.IHeader[]
            = fixtures.barChartWithStackByAndOnlyOneStack.executionResponse.dimensions[1].headers;
        const header: Execution.IResultMeasureHeaderItem = { measureHeaderItem: { name: 'not important', order: 99 } };
        expect(
            getMeasureDrillItem(responseHeaders1, header)
        ).toBe(null);
        expect(
            getMeasureDrillItem(responseHeaders2, header)
        ).toBe(null);
    });
});

describe('assignDrillItemsAndType', () => {
    it('should assign measure header item drillItems and type to header', () => {
        const header: IGridHeader = {
            headerName: 'test',
            drillItems: []
        };
        const currentHeader = fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[1][2][0];
        const responseHeaders = fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions[1].headers;
        const headerIndex = 0;
        const drillItems: IDrillItem[] = [];
        assignDrillItemsAndType(
            header,
            currentHeader,
            responseHeaders,
            headerIndex,
            drillItems
        );
        expect(header.type).toEqual('MEASURE_COLUMN');
        expect(header.drillItems).toEqual([{
            identifier: 'aaEGaXAEgB7U',
            localIdentifier: 'franchiseFeesIdentifier',
            title: '$ Franchise Fees',
            uri: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/6685'
        }]);
    });
    it('should assign attribute header type to header and attribute and attribute value to drillItems', () => {
        const header: IGridHeader = {
            headerName: 'test',
            drillItems: []
        };
        const currentHeader = fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems[0][0][0];
        const responseHeaders = fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions[0].headers;
        const headerIndex = 0;
        const drillItems: IDrillItem[] = [];
        assignDrillItemsAndType(
            header,
            currentHeader,
            responseHeaders,
            headerIndex,
            drillItems
        );
        expect(header.type).toEqual('COLUMN_ATTRIBUTE_COLUMN');
        expect(drillItems).toEqual([
            // attribute value
            {
                title: 'Alabama',
                uri: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210/elements?id=6340109'
            },
            // attribute
            {
                identifier: 'label.restaurantlocation.locationstate',
                localIdentifier: 'state',
                title: 'Location State',
                uri: '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2211'
            }
        ]);
        // assign empty array to drillItems header. Only leaf headers (measures) should have assigned drill items
        expect(header.drillItems).toEqual([]);
    });
});
