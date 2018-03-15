// (C) 2007-2018 GoodData Corporation
import { TableHeader } from '../../../../../interfaces/Table';
import { getCellClassNames, getColumnAlign, getStyledLabel } from '../cell';
import { ALIGN_LEFT, ALIGN_RIGHT } from '../../constants/align';
import { TABLE_HEADERS_2A_3M } from '../../fixtures/2attributes3measures';

const ATTRIBUTE_HEADER: TableHeader = TABLE_HEADERS_2A_3M[0];
const FIRST_MEASURE_HEADER: TableHeader = TABLE_HEADERS_2A_3M[2];
const SECOND_MEASURE_HEADER: TableHeader = TABLE_HEADERS_2A_3M[3];

describe('Table utils - Cell', () => {
    describe('getColumnAlign', () => {
        it('should get column align for attribute', () => {
            expect(getColumnAlign(ATTRIBUTE_HEADER)).toEqual(ALIGN_LEFT);
        });

        it('should get column align for measure', () => {
            expect(getColumnAlign(FIRST_MEASURE_HEADER)).toEqual(ALIGN_RIGHT);
        });
    });

    describe('getCellClassNames', () => {
        it('should get class names for non drillable cell', () => {
            expect(getCellClassNames(3, 9, false)).toEqual('s-cell-3-9 s-table-cell');
        });

        it('should get class names for drillable cell', () => {
            expect(getCellClassNames(3, 9, true)).toEqual('gd-cell-drillable s-cell-3-9 s-table-cell');
        });
    });

    describe('getStyledLabel', () => {
        it('should get styled label for attribute', () => {
            expect(getStyledLabel(ATTRIBUTE_HEADER, { uri: 'foo', name: 'Apple' })).toEqual({
                style: {},
                label: 'Apple'
            });
        });

        it('should get styled dash when the value is null', () => {
            expect(getStyledLabel(FIRST_MEASURE_HEADER, null)).toEqual({
                style: {
                    color: '#94a1ad',
                    fontWeight: 'bold'
                },
                label: '–'
            });
        });

        it('should get styled label for measure without color', () => {
            expect(getStyledLabel(FIRST_MEASURE_HEADER, '1234567.89')).toEqual({
                style: {},
                label: '$1,234,567.89'
            });
        });

        it('should get styled label for measure with color', () => {
            expect(getStyledLabel(SECOND_MEASURE_HEADER, '9876543.21')).toEqual({
                style: { color: '#FF0000' },
                label: '$9,876,543.21'
            });
        });

        it('should not apply color whe the argument applyColor is false', () => {
            expect(getStyledLabel(SECOND_MEASURE_HEADER, '9876543.21', false)).toEqual({
                style: {},
                label: '$9,876,543.21'
            });
        });

        it('should get styled dash when the value is null even if the param applyColor is false', () => {
            expect(getStyledLabel(FIRST_MEASURE_HEADER, null, false)).toEqual({
                style: {
                    color: '#94a1ad',
                    fontWeight: 'bold'
                },
                label: '–'
            });
        });
    });
});
