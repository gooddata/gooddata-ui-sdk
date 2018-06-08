// (C) 2007-2018 GoodData Corporation
import { IPositions, ITableDimensions } from '../../../../../interfaces/Table';
import { ITotalWithData } from '../../../../../interfaces/Totals';
import { TOTALS_DEFINITION_3 } from '../fixtures/totalsWithData';

import {
    getFooterHeight,
    getFooterPositions,
    isFooterAtDefaultPosition,
    isFooterAtEdgePosition
} from '../footer';

describe('Table utils - Footer', () => {
    describe('getFooterHeight', () => {
        const twoTotals: ITotalWithData[] = [
            { type: 'sum', outputMeasureIndexes: [], values: [] },
            { type: 'avg', outputMeasureIndexes: [], values: [] }
        ];

        describe('edit allowed and totals visible', () => {
            it('should return sum of aggregation rows and height of the row for adding aggregations', () => {
                const editAllowed: boolean = true;
                const totalsAreVisible: boolean = true;
                expect(getFooterHeight(twoTotals, editAllowed, totalsAreVisible)).toEqual((2 * 30) + 50);
            });
        });

        describe('edit not allowed and totals visible', () => {
            it('should return sum of aggregation rows', () => {
                const editAllowed: boolean = false;
                const totalsAreVisible: boolean = true;
                expect(getFooterHeight(twoTotals, editAllowed, totalsAreVisible)).toEqual(2 * 30);
            });
        });

        describe('edit not allowed and totals not visible', () => {
            it('should return sum of aggregation rows', () => {
                const editAllowed: boolean = false;
                const totalsAreVisible: boolean = false;
                expect(getFooterHeight(twoTotals, editAllowed, totalsAreVisible)).toEqual(0);
            });
        });

        describe('edit allowed and totals visible, empty totals', () => {
            it('should return height of the row for adding aggregations', () => {
                const editAllowed: boolean = true;
                const totalsAreVisible: boolean = true;
                const emptyTotals: ITotalWithData[] = [];
                expect(getFooterHeight(emptyTotals, editAllowed, totalsAreVisible)).toEqual(50);
            });
        });
    });

    describe('isFooterAtDefaultPosition', () => {
        const windowHeight: number = 500;

        it('should return true if footer is scrolled above the bottom of the viewport', () => {
            const tableBottom: number = 250;
            const hasHiddenRows: boolean = false;
            expect(isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight))
                .toEqual(true);
        });

        it('should return true if footer is scrolled near the bottom of the viewport ' +
            'and table contains hidden rows', () => {
            const tableBottom: number = 510;
            const hasHiddenRows: boolean = true;
            expect(isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight))
                .toEqual(true);
        });

        it('should return false if footer is scrolled near the bottom of the viewport ' +
            'and table has no hidden rows', () => {
            const tableBottom: number = 510;
            const hasHiddenRows: boolean = false;
            expect(isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight))
                .toEqual(false);
        });

        it('should return false if footer is scrolled below the bottom of the viewport', () => {
            const tableBottom: number = 750;
            const hasHiddenRows: boolean = false;
            expect(isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight))
                .toEqual(false);
        });
    });

    describe('isFooterAtEdgePosition', () => {
        const totals: ITotalWithData[] = TOTALS_DEFINITION_3;
        const hasHiddenRows: boolean = false;
        const windowHeight: number = 500;
        const totalsEditAllowed: boolean = false;
        const totalsAreVisible: boolean = true;

        it('should return true if footer is at its edge position', () => {
            const tableDimensions: ITableDimensions = {
                height: 500,
                bottom: 1000
            };

            const footerAtEdgePosition: boolean = isFooterAtEdgePosition(
                hasHiddenRows, totals, windowHeight, totalsEditAllowed, totalsAreVisible, tableDimensions
            );

            expect(footerAtEdgePosition).toBe(true);
        });

        it('should return false if footer is not at its edge position', () => {
            const tableDimensions: ITableDimensions = {
                height: 500,
                bottom: 100
            };

            const footerAtEdgePosition: boolean = isFooterAtEdgePosition(
                hasHiddenRows, totals, windowHeight, totalsEditAllowed, totalsAreVisible, tableDimensions
            );

            expect(footerAtEdgePosition).toBe(false);
        });
    });

    describe('getFooterPositions', () => {
        it('should return proper footer positions', () => {
            const totals: ITotalWithData[] = TOTALS_DEFINITION_3;
            let hasHiddenRows: boolean = true;
            let tableDimensions: ITableDimensions = {
                height: 300,
                bottom: 500
            };
            let windowHeight: number = 400;
            let totalsEditAllowed: boolean = false;
            let totalsAreVisible: boolean = true;

            let footerPositions: IPositions = getFooterPositions(
                hasHiddenRows, totals, windowHeight, totalsEditAllowed, totalsAreVisible, tableDimensions
            );

            expect(footerPositions).toEqual({
                absoluteTop: -100,
                defaultTop: -15,
                edgeTop: -139,
                fixedTop: 100
            });

            tableDimensions = {
                height: 500,
                bottom: 1000
            };
            windowHeight = 800;

            footerPositions = getFooterPositions(
                hasHiddenRows, totals, windowHeight, totalsEditAllowed, totalsAreVisible, tableDimensions
            );
            expect(footerPositions).toEqual({
                absoluteTop: -200,
                defaultTop: -15,
                edgeTop: -339,
                fixedTop: 300
            });

            totalsEditAllowed = true;

            footerPositions = getFooterPositions(
                hasHiddenRows, totals, windowHeight, totalsEditAllowed, totalsAreVisible, tableDimensions
            );
            expect(footerPositions).toEqual({
                absoluteTop: -200,
                defaultTop: -15,
                edgeTop: -289,
                fixedTop: 300
            });

            hasHiddenRows = false;
            tableDimensions = {
                height: 300,
                bottom: 100
            };
            windowHeight = 500;
            totalsEditAllowed = false;

            footerPositions = getFooterPositions(
                hasHiddenRows, totals, windowHeight, totalsEditAllowed, totalsAreVisible, tableDimensions
            );
            expect(footerPositions).toEqual({
                absoluteTop: 400,
                defaultTop: -0,
                edgeTop: -154,
                fixedTop: 200
            });

            totalsAreVisible = false;

            footerPositions = getFooterPositions(
                hasHiddenRows, totals, windowHeight, totalsEditAllowed, totalsAreVisible, tableDimensions
            );
            expect(footerPositions).toEqual({
                absoluteTop: 400,
                defaultTop: -0,
                edgeTop: -244,
                fixedTop: 200
            });
        });
    });
});
