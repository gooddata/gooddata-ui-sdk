// (C) 2007-2018 GoodData Corporation
import {
    identifyHeader,
    headerToGrid,
    getColumnHeaders,
    getRowHeaders,
    getFields,
    getRow,
    getMinimalRowData,
    executionToAGGridAdapter
} from '../agGrid';

import * as fixtures from '../../../stories/test_data/fixtures';

describe('identifyHeader', () => {
    it('should return correct field key for an attribute header', () => {
        expect(
            identifyHeader(fixtures.agTableWithColumnAndRowAttributes.executionResult.headerItems[0][0][0])
        ).toBe('a_2210_6340109');
    });

    it('should return correct field key for a measure header', () => {
        expect(
            identifyHeader(fixtures.agTableWithColumnAndRowAttributes.executionResult.headerItems[1][2][0])
        ).toBe('m_0');
    });
});

describe('headerToGrid', () => {
    it('should return correct grid header for an attribute header with correct prefix', () => {
        expect(
            headerToGrid(fixtures.agTableWithColumnAndRowAttributes.executionResult.headerItems[0][0][0], 'prefix_')
        ).toEqual({ field: 'prefix_a_2210_6340109', headerName: 'Alabama' });
    });

    it('should return correct grid header for a measure header with correct prefix', () => {
        expect(
            headerToGrid(fixtures.agTableWithColumnAndRowAttributes.executionResult.headerItems[1][2][0], 'prefix_')
        ).toEqual({ field: 'prefix_m_0', headerName: '$ Franchise Fees' });
    });
});

describe('getColumnHeaders', () => {
    it('should return hierarchical column headers', () => {
        expect(
            getColumnHeaders(fixtures.agTableWithColumnAndRowAttributes.executionResult.headerItems[1])
        ).toMatchSnapshot();
    });
});

describe('getRowHeaders', () => {
    it('should return an array of grid headers', () => {
        expect(
            getRowHeaders(fixtures.agTableWithColumnAndRowAttributes.executionResponse.dimensions[0].headers)
        ).toEqual(
            [
                { field: 'a_2211', headerName: 'Location State' },
                { field: 'a_2205', headerName: 'Location Name' }
            ]
        );
    });
});

describe('getRowHeaders', () => {
    it('should return an array of grid headers', () => {
        expect(
            getRowHeaders(fixtures.agTableWithColumnAndRowAttributes.executionResponse.dimensions[0].headers)
        ).toEqual(
            [
                { field: 'a_2211', headerName: 'Location State' },
                { field: 'a_2205', headerName: 'Location Name' }
            ]
        );
    });
});

describe('getFields', () => {
    it('should return an array of all column fields', () => {
        expect(
            getFields(fixtures.agTableWithColumnAndRowAttributes.executionResult.headerItems[1])
        ).toEqual(
            [
                'a_2009_1|a_2071_1|m_0',
                'a_2009_1|a_2071_1|m_1',
                'a_2009_1|a_2071_1|m_2',
                'a_2009_1|a_2071_1|m_3',
                'a_2009_1|a_2071_2|m_0',
                'a_2009_1|a_2071_2|m_1',
                'a_2009_1|a_2071_2|m_2',
                'a_2009_1|a_2071_2|m_3',
                'a_2009_1|a_2071_3|m_0',
                'a_2009_1|a_2071_3|m_1',
                'a_2009_1|a_2071_3|m_2',
                'a_2009_1|a_2071_3|m_3',
                'a_2009_2|a_2071_4|m_0',
                'a_2009_2|a_2071_4|m_1',
                'a_2009_2|a_2071_4|m_2',
                'a_2009_2|a_2071_4|m_3',
                'a_2009_2|a_2071_5|m_0',
                'a_2009_2|a_2071_5|m_1',
                'a_2009_2|a_2071_5|m_2',
                'a_2009_2|a_2071_5|m_3',
                'a_2009_2|a_2071_6|m_0',
                'a_2009_2|a_2071_6|m_1',
                'a_2009_2|a_2071_6|m_2',
                'a_2009_2|a_2071_6|m_3',
                'a_2009_3|a_2071_7|m_0',
                'a_2009_3|a_2071_7|m_1',
                'a_2009_3|a_2071_7|m_2',
                'a_2009_3|a_2071_7|m_3',
                'a_2009_3|a_2071_8|m_0',
                'a_2009_3|a_2071_8|m_1',
                'a_2009_3|a_2071_8|m_2',
                'a_2009_3|a_2071_8|m_3',
                'a_2009_3|a_2071_9|m_0',
                'a_2009_3|a_2071_9|m_1',
                'a_2009_3|a_2071_9|m_2',
                'a_2009_3|a_2071_9|m_3',
                'a_2009_4|a_2071_10|m_0',
                'a_2009_4|a_2071_10|m_1',
                'a_2009_4|a_2071_10|m_2',
                'a_2009_4|a_2071_10|m_3',
                'a_2009_4|a_2071_11|m_0',
                'a_2009_4|a_2071_11|m_1',
                'a_2009_4|a_2071_11|m_2',
                'a_2009_4|a_2071_11|m_3',
                'a_2009_4|a_2071_12|m_0',
                'a_2009_4|a_2071_12|m_1',
                'a_2009_4|a_2071_12|m_2',
                'a_2009_4|a_2071_12|m_3'
            ]
        );
    });
});

describe('getRow', () => {
    it('should return a grid row', () => {
        const headerItems = fixtures.agTableWithColumnAndRowAttributes.executionResult.headerItems;
        const rowHeaders = getRowHeaders(
            fixtures.agTableWithColumnAndRowAttributes.executionResponse.dimensions[0].headers
        );

        const columnFields: string[] = getFields(headerItems[1]);

        expect(
            getRow(
                fixtures.agTableWithColumnAndRowAttributes.executionResult.data[0],
                0,
                columnFields,
                rowHeaders,
                headerItems[0]
            )
        ).toEqual({
            'a_2009_1|a_2071_1|m_0': '160104.5665',
            'a_2009_1|a_2071_1|m_1': '49454.8215',
            'a_2009_1|a_2071_1|m_2': '40000',
            'a_2009_1|a_2071_1|m_3': '70649.745',
            'a_2009_1|a_2071_2|m_0': '156148.86625',
            'a_2009_1|a_2071_2|m_1': '47826.00375',
            'a_2009_1|a_2071_2|m_2': '40000',
            'a_2009_1|a_2071_2|m_3': '68322.8625',
            'a_2009_1|a_2071_3|m_0': '154299.8485',
            'a_2009_1|a_2071_3|m_1': '47064.6435',
            'a_2009_1|a_2071_3|m_2': '40000',
            'a_2009_1|a_2071_3|m_3': '67235.205',
            'a_2009_2|a_2071_4|m_0': '158572.501',
            'a_2009_2|a_2071_4|m_1': '48823.971',
            'a_2009_2|a_2071_4|m_2': '40000',
            'a_2009_2|a_2071_4|m_3': '69748.53',
            'a_2009_2|a_2071_5|m_0': '152789.662',
            'a_2009_2|a_2071_5|m_1': '46442.802',
            'a_2009_2|a_2071_5|m_2': '40000',
            'a_2009_2|a_2071_5|m_3': '66346.86',
            'a_2009_2|a_2071_6|m_0': '158587.036',
            'a_2009_2|a_2071_6|m_1': '48829.956',
            'a_2009_2|a_2071_6|m_2': '40000',
            'a_2009_2|a_2071_6|m_3': '69757.08',
            'a_2009_3|a_2071_7|m_0': '156553.19425',
            'a_2009_3|a_2071_7|m_1': '47992.49175',
            'a_2009_3|a_2071_7|m_2': '40000',
            'a_2009_3|a_2071_7|m_3': '68560.7025',
            'a_2009_3|a_2071_8|m_0': '147504.62125',
            'a_2009_3|a_2071_8|m_1': '44266.60875',
            'a_2009_3|a_2071_8|m_2': '40000',
            'a_2009_3|a_2071_8|m_3': '63238.0125',
            'a_2009_3|a_2071_9|m_0': '157944.04075',
            'a_2009_3|a_2071_9|m_1': '48565.19325',
            'a_2009_3|a_2071_9|m_2': '40000',
            'a_2009_3|a_2071_9|m_3': '69378.8475',
            'a_2009_4|a_2071_10|m_0': '156878.19175',
            'a_2009_4|a_2071_10|m_1': '48126.31425',
            'a_2009_4|a_2071_10|m_2': '40000',
            'a_2009_4|a_2071_10|m_3': '68751.8775',
            'a_2009_4|a_2071_11|m_0': '156446.52775',
            'a_2009_4|a_2071_11|m_1': '47948.57025',
            'a_2009_4|a_2071_11|m_2': '40000',
            'a_2009_4|a_2071_11|m_3': '68497.9575',
            'a_2009_4|a_2071_12|m_0': '130719.01675',
            'a_2009_4|a_2071_12|m_1': '37354.88925',
            'a_2009_4|a_2071_12|m_2': '40000',
            'a_2009_4|a_2071_12|m_3': '53364.1275',
            'a_2205': 'Montgomery',
            'a_2211': 'Alabama'
          });
    });
});

describe('getMinimalRowData', () => {
    it('should return a two-dimensional array of empty values when no measure data are available', () => {
        expect(
            getMinimalRowData(
                [],
                fixtures.agTableWithColumnAndRowAttributes.executionResult.headerItems[0]
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
                fixtures.agTableWithColumnAndRowAttributes.executionResult.headerItems[0]
            )
        ).toBe(data);
    });
});

describe('executionToAGGridAdapter', () => {
    it('should return grid data for executionResult', () => {
        expect(
            executionToAGGridAdapter({
                executionResponse: fixtures.agTableWithColumnAndRowAttributes.executionResponse,
                executionResult: fixtures.agTableWithColumnAndRowAttributes.executionResult
            })
        ).toMatchSnapshot();
    });
});
