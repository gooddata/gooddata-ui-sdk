// (C) 2007-2018 GoodData Corporation
import {
    calculateArrowPosition,
    getHeaderClassNames,
    getHeaderOffset,
    isHeaderAtDefaultPosition,
    isHeaderAtEdgePosition,
    getHeaderPositions,
    getTooltipAlignPoints,
    getTooltipSortAlignPoints
} from '../header';

import { IAttributeTableHeader, IPositions, ITableDimensions } from '../../../../../interfaces/Table';

import { ALIGN_LEFT, ALIGN_RIGHT } from '../../constants/align';
import { TABLE_HEADERS_2A_3M } from '../../fixtures/2attributes3measures';
import { TOTALS_DEFINITION_3 } from '../fixtures/totalsWithData';
import { ITotalWithData } from '../../../../../interfaces/Totals';
import 'jest';

const ATTRIBUTE_HEADER = TABLE_HEADERS_2A_3M[0] as IAttributeTableHeader;

function mockGetBoundingClientRect(): ClientRect {
    return {
        left: 15,
        right: 800,
        bottom: 0,
        top: 0,
        height: 0,
        width: 0
    };
}

describe('Table utils - Header', () => {
    describe('calculateArrowPosition', () => {
        it('should get min arrow position', () => {
            expect(calculateArrowPosition(
                { width: 5, align: ALIGN_LEFT, index: 2 },
                12,
                { getBoundingClientRect: mockGetBoundingClientRect }
            )).toEqual({ left: '3px' });
        });

        it('should get max arrow position', () => {
            expect(calculateArrowPosition(
                { width: 200, align: ALIGN_LEFT, index: 99 },
                600,
                { getBoundingClientRect: mockGetBoundingClientRect }
            )).toEqual({ left: '772px' });
        });

        it('should calculate arrow position for left aligned column', () => {
            expect(calculateArrowPosition(
                { width: 50, align: ALIGN_LEFT, index: 3 },
                12,
                { getBoundingClientRect: mockGetBoundingClientRect }
            )).toEqual({ left: '141px' });
        });

        it('should calculate arrow position for right aligned column', () => {
            expect(calculateArrowPosition(
                { width: 50, align: ALIGN_RIGHT, index: 3 },
                12,
                { getBoundingClientRect: mockGetBoundingClientRect }
            )).toEqual({ left: '175px' });
        });
    });

    describe('getHeaderClassNames', () => {
        it('should get header class names', () => {
            expect(
                getHeaderClassNames(ATTRIBUTE_HEADER)
            ).toEqual('gd-table-header-ordering s-id-1st_attr_df_local_identifier');
        });
    });

    describe('getHeaderOffset', () => {
        it('should return proper header offset', () => {
            const hasHiddenRows: boolean = true;
            expect(getHeaderOffset(hasHiddenRows)).toEqual(71);
        });

        it('should return zero header offset when table has no hidden rows', () => {
            const hasHiddenRows: boolean = false;
            expect(getHeaderOffset(hasHiddenRows)).toEqual(56);
        });
    });

    describe('isHeaderAtDefaultPosition', () => {
        it('should return true if header is scrolled below zero sticky header offset', () => {
            const stickyHeaderOffset: number = 0;
            const tableTop: number = 10;
            expect(isHeaderAtDefaultPosition(stickyHeaderOffset, tableTop)).toEqual(true);
        });

        it('should return true if header is scrolled exactly at zero sticky header offset', () => {
            const stickyHeaderOffset: number = 0;
            const tableTop: number = 0;
            expect(isHeaderAtDefaultPosition(stickyHeaderOffset, tableTop)).toEqual(true);
        });

        it('should return true if header is scrolled exactly at sticky header offset', () => {
            const stickyHeaderOffset: number = 10;
            const tableTop: number = 10;
            expect(isHeaderAtDefaultPosition(stickyHeaderOffset, tableTop)).toEqual(true);
        });

        it('should return false if header is scrolled above zero sticky header offset', () => {
            const stickyHeaderOffset: number = 0;
            const tableTop: number = -10;
            expect(isHeaderAtDefaultPosition(stickyHeaderOffset, tableTop)).toEqual(false);
        });

        it('should return false if header is scrolled above sticky header offset', () => {
            const stickyHeaderOffset: number = 10;
            const tableTop: number = 8;
            expect(isHeaderAtDefaultPosition(stickyHeaderOffset, tableTop)).toEqual(false);
        });
    });

    describe('isHeaderAtEdgePosition', () => {
        const stickyHeaderOffset: number = 0;
        const hasHiddenRows: boolean = true;
        const totals: ITotalWithData[] = [];
        const totalsEditAllowed: boolean = false;
        const totalsAreVisible: boolean = false;

        it('should return true if header is at its edge position', () => {
            const tableBottom: number = 50;

            const headerAtEdgePosition: boolean = isHeaderAtEdgePosition(
                stickyHeaderOffset, hasHiddenRows, totals, tableBottom, totalsEditAllowed, totalsAreVisible
            );

            expect(headerAtEdgePosition).toBe(true);
        });

        it('should return false if header is not at its edge position', () => {
            const tableBottom: number = 500;
            const headerAtEdgePosition: boolean = isHeaderAtEdgePosition(
                stickyHeaderOffset, hasHiddenRows, totals, tableBottom, totalsEditAllowed, totalsAreVisible
            );

            expect(headerAtEdgePosition).toBe(false);
        });
    });

    describe('getHeaderPositions', () => {
        it('should return proper header positions', () => {
            const stickyHeaderOffset: number = 0;
            let hasHiddenRows: boolean = true;
            let totals: ITotalWithData[] = [];
            let totalsEditAllowed: boolean = false;
            let totalsVisible: boolean = false;
            let tableDimensions: ITableDimensions = {
                height: 500,
                top: 50
            };
            let headerPositions: IPositions = getHeaderPositions(
                stickyHeaderOffset, hasHiddenRows, totals, totalsEditAllowed, totalsVisible, tableDimensions
            );

            expect(headerPositions).toEqual({
                absoluteTop: -50,
                defaultTop: 0,
                edgeTop: 414,
                fixedTop: 0
            });

            hasHiddenRows = true;
            totals = TOTALS_DEFINITION_3;
            tableDimensions = {
                height: 500,
                top: 50
            };
            totalsVisible = true;

            headerPositions = getHeaderPositions(
                stickyHeaderOffset, hasHiddenRows, totals, totalsEditAllowed, totalsVisible, tableDimensions
            );
            expect(headerPositions).toEqual({
                absoluteTop: -50,
                defaultTop: 0,
                edgeTop: 324,
                fixedTop: 0
            });

            hasHiddenRows = false;
            totals = TOTALS_DEFINITION_3;

            headerPositions = getHeaderPositions(
                stickyHeaderOffset, hasHiddenRows, totals, totalsEditAllowed, totalsVisible, tableDimensions
            );
            expect(headerPositions).toEqual({
                absoluteTop: -50,
                defaultTop: 0,
                edgeTop: 354,
                fixedTop: 0
            });

            totalsEditAllowed = true;
            headerPositions = getHeaderPositions(
                stickyHeaderOffset, hasHiddenRows, totals, totalsEditAllowed, totalsVisible, tableDimensions
            );
            expect(headerPositions).toEqual({
                absoluteTop: -50,
                defaultTop: 0,
                edgeTop: 304,
                fixedTop: 0
            });

            totalsEditAllowed = false;
            hasHiddenRows = true;
            totals = [];
            tableDimensions = {
                height: 200,
                top: 100
            };

            headerPositions = getHeaderPositions(
                stickyHeaderOffset, hasHiddenRows, totals, totalsEditAllowed, totalsVisible, tableDimensions
            );
            expect(headerPositions).toEqual({
                absoluteTop: -100,
                defaultTop: 0,
                edgeTop: 114,
                fixedTop: 0
            });

            hasHiddenRows = false;
            totals = [];

            headerPositions = getHeaderPositions(
                stickyHeaderOffset, hasHiddenRows, totals, totalsEditAllowed, totalsVisible, tableDimensions
            );
            expect(headerPositions).toEqual({
                absoluteTop: -100,
                defaultTop: 0,
                edgeTop: 144,
                fixedTop: 0
            });
        });
    });

    describe('getTooltipAlignPoints', () => {
        it('should get tooltip align points for left aligned column', () => {
            expect(getTooltipAlignPoints(ALIGN_LEFT)).toEqual(
                [
                    {
                        align: 'bl tl',
                        offset: { x: 8, y: 0 }
                    },
                    {
                        align: 'bl tc',
                        offset: { x: 8, y: 0 }
                    },
                    {
                        align: 'bl tr',
                        offset: { x: 8, y: 0 }
                    }
                ]
            );
        });

        it('should get tooltip align points for right aligned column', () => {
            expect(getTooltipAlignPoints(ALIGN_RIGHT)).toEqual(
                [
                    {
                        align: 'br tr',
                        offset: { x: -8, y: 0 }
                    },
                    {
                        align: 'br tc',
                        offset: { x: -8, y: 0 }
                    },
                    {
                        align: 'br tl',
                        offset: { x: -8, y: 0 }
                    }
                ]
            );
        });
    });

    describe('getTooltipSortAlignPoints', () => {
        it('should get tooltip sort align points for left aligned column', () => {
            expect(getTooltipSortAlignPoints(ALIGN_LEFT)).toEqual(
                [
                    {
                        align: 'bl tl',
                        offset: { x: 8, y: -8 }
                    },
                    {
                        align: 'bl tc',
                        offset: { x: 8, y: -8 }
                    },
                    {
                        align: 'bl tr',
                        offset: { x: 8, y: -8 }
                    },
                    {
                        align: 'br tl',
                        offset: { x: -8, y: -8 }
                    },
                    {
                        align: 'tl bl',
                        offset: { x: 8, y: 8 }
                    },
                    {
                        align: 'tl bc',
                        offset: { x: 8, y: 8 }
                    },
                    {
                        align: 'tl br',
                        offset: { x: 8, y: 8 }
                    },
                    {
                        align: 'tr bl',
                        offset: { x: -8, y: 8 }
                    }
                ]
            );
        });

        it('should get tooltip sort align points for right aligned column', () => {
            expect(getTooltipSortAlignPoints(ALIGN_RIGHT)).toEqual(
                [
                    {
                        align: 'br tr',
                        offset: { x: -8, y: -8 }
                    },
                    {
                        align: 'br tc',
                        offset: { x: -8, y: -8 }
                    },
                    {
                        align: 'br tl',
                        offset: { x: -8, y: -8 }
                    },
                    {
                        align: 'bl tr',
                        offset: { x: 8, y: -8 }
                    },
                    {
                        align: 'tr br',
                        offset: { x: -8, y: 8 }
                    },
                    {
                        align: 'tr bc',
                        offset: { x: -8, y: 8 }
                    },
                    {
                        align: 'tr bl',
                        offset: { x: -8, y: 8 }
                    },
                    {
                        align: 'tl br',
                        offset: { x: 8, y: 8 }
                    }
                ]
            );
        });
    });
});
