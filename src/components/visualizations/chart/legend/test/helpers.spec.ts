// (C) 2007-2018 GoodData Corporation
import noop = require('lodash/noop');
import {
    calculateFluidLegend,
    calculateStaticLegend,
    ITEM_HEIGHT,
    RESPONSIVE_ITEM_MIN_WIDTH,
    LEGEND_PADDING,
    getLegendConfig,
    getHeatmapLegendConfiguration,
    UTF_NON_BREAKING_SPACE
} from '../helpers';
import { RIGHT, TOP } from '../PositionTypes';

describe('helpers', () => {
    describe('calculateFluidLegend', () => {
        describe('2 columns layout', () => {
            const containerWidth = 500;

            it('should show 4 items with paging for 10 series', () => {
                const {
                    hasPaging,
                    visibleItemsCount
                } = calculateFluidLegend(10, containerWidth);
                expect(hasPaging).toEqual(true);
                expect(visibleItemsCount).toEqual(4);
            });

            it('should show 4 items without paging for 4 series', () => {
                const {
                    hasPaging,
                    visibleItemsCount
                } = calculateFluidLegend(4, containerWidth);
                expect(hasPaging).toEqual(false);
                expect(visibleItemsCount).toEqual(4);
            });
        });

        describe('3 columns layout', () => {
            const containerWidth = 700;

            it('should show 6 items with paging for 10 series', () => {
                const {
                    hasPaging,
                    visibleItemsCount
                } = calculateFluidLegend(10, containerWidth);
                expect(hasPaging).toEqual(true);
                expect(visibleItemsCount).toEqual(6);
            });

            it('should show 6 items without paging for 6 series', () => {
                const {
                    hasPaging,
                    visibleItemsCount
                } = calculateFluidLegend(6, containerWidth);
                expect(hasPaging).toEqual(false);
                expect(visibleItemsCount).toEqual(6);
            });
        });

        describe('overlapping columns', () => {
            const containerWidth =
                (3 * RESPONSIVE_ITEM_MIN_WIDTH) + 1
                + (2 * LEGEND_PADDING);

            it('should not show paging for 5 items', () => {
                const {
                    hasPaging,
                    visibleItemsCount
                } = calculateFluidLegend(6, containerWidth);
                expect(hasPaging).toEqual(false);
                expect(visibleItemsCount).toEqual(6);
            });

            it('should show paging for 7 items', () => {
                const {
                    hasPaging,
                    visibleItemsCount
                } = calculateFluidLegend(7, containerWidth);
                expect(hasPaging).toEqual(true);
                expect(visibleItemsCount).toEqual(4);
            });
        });
    });

    describe('calculateStaticLegend', () => {
        it('should show paging if needed', () => {
            const itemsCount = 10;
            const containerHeight = itemsCount * ITEM_HEIGHT;
            let legendObj = calculateStaticLegend(itemsCount, containerHeight);

            expect(legendObj.hasPaging).toEqual(false);
            expect(legendObj.visibleItemsCount).toEqual(10);

            legendObj = calculateStaticLegend(itemsCount, containerHeight - ITEM_HEIGHT);

            expect(legendObj.hasPaging).toEqual(true);
            expect(legendObj.visibleItemsCount).toEqual(6);
        });
    });

    describe('getLegendConfig', () => {
        it('should enable position on right by default', () => {
            const config = getLegendConfig({}, true, [], noop);
            expect(config.position).toEqual(RIGHT);
            expect(config.enabled).toEqual(true);
        });

        it('should be able to override defaults', () => {
            const config = getLegendConfig({
                position: TOP,
                enabled: false
            }, true, [], noop);
            expect(config.position).toEqual(TOP);
            expect(config.enabled).toEqual(false);
        });
    });

    describe('getHeatmapLegendConfiguration', () => {
        const format = '#,##';
        const numericSymbols = ['k', 'm', 'b', 'g'];
        const series = [
            { range: { from: 0, to: 10 }, color: 'rgb(255,255,255)', legendIndex: 0 },
            { range: { from: 10, to: 20 }, color: 'rgb(0,0,0)', legendIndex: 1 },
            { range: { from: 20, to: 30 }, color: 'rgb(0,0,0)', legendIndex: 2 },
            { range: { from: 30, to: 40 }, color: 'rgb(0,0,0)', legendIndex: 3 },
            { range: { from: 40, to: 50 }, color: 'rgb(0,0,0)', legendIndex: 4 },
            { range: { from: 50, to: 60 }, color: 'rgb(0,0,0)', legendIndex: 5 },
            { range: { from: 60, to: 70 }, color: 'rgb(0,0,0)', legendIndex: 6 }
        ];
        const seriesForShortening = [
            { range: { from: 99999, to: 100000 }, color: 'rgb(255,255,255)', legendIndex: 0 },
            { range: { from: 100000, to: 100001 }, color: 'rgb(0,0,0)', legendIndex: 1 },
            { range: { from: 100002, to: 100003  }, color: 'rgb(0,0,0)', legendIndex: 2 },
            { range: { from: 100003, to: 100004  }, color: 'rgb(0,0,0)', legendIndex: 3 },
            { range: { from: 100004, to: 100005  }, color: 'rgb(0,0,0)', legendIndex: 4 },
            { range: { from: 100005, to: 100006  }, color: 'rgb(0,0,0)', legendIndex: 5 },
            { range: { from: 100006, to: 100007  }, color: 'rgb(0,0,0)', legendIndex: 6 }
        ];
        const labels = [
            { class: 'left', key: 'label-0', label: '0' },
            { class: 'center', key: 'label-1', label: '10' },
            { class: 'empty', key: 'empty-1', label: UTF_NON_BREAKING_SPACE },
            { class: 'center', key: 'label-2', label: '20' },
            { class: 'empty', key: 'empty-2', label: UTF_NON_BREAKING_SPACE },
            { class: 'middle', key: 'label-3', label: '30' },
            { class: 'empty', key: 'empty-3', label: UTF_NON_BREAKING_SPACE },
            { class: 'middle', key: 'label-4', label: '40' },
            { class: 'empty', key: 'empty-4', label: UTF_NON_BREAKING_SPACE },
            { class: 'center', key: 'label-5', label: '50' },
            { class: 'empty', key: 'empty-5', label: UTF_NON_BREAKING_SPACE },
            { class: 'center', key: 'label-6', label: '60' },
            { class: 'right', key: 'label-7', label: '70' }
        ];
        const shortenedLabels = [
            { class: 'left', key: 'label-0', label: '99999' },
            { class: 'dots', key: 'label-1', label: '...' },
            { class: 'middle', key: 'label-2', label: '100002' },
            { class: 'dots', key: 'label-3', label: '...' },
            { class: 'center-empty', key: 'label-4', label: UTF_NON_BREAKING_SPACE },
            { class: 'dots', key: 'label-5', label: '...' },
            { class: 'middle', key: 'label-6', label: '100005' },
            { class: 'dots', key: 'label-7', label: '...' },
            { class: 'right', key: 'label-8', label: '100007' }
        ];
        const boxes = [
            { class: null, key: 'item-0', style: { backgroundColor: 'rgb(255,255,255)', border: '1px solid #ccc' } },
            { class: null, key: 'item-1', style: { backgroundColor: 'rgb(0,0,0)', border: 'none' } },
            { class: null, key: 'item-2', style: { backgroundColor: 'rgb(0,0,0)', border: 'none' } },
            { class: 'middle', key: 'item-3', style: { backgroundColor: 'rgb(0,0,0)', border: 'none' } },
            { class: null, key: 'item-4', style: { backgroundColor: 'rgb(0,0,0)', border: 'none' } },
            { class: null, key: 'item-5', style: { backgroundColor: 'rgb(0,0,0)', border: 'none' } },
            { class: null, key: 'item-6', style: { backgroundColor: 'rgb(0,0,0)', border: 'none' } }
        ];

        it('should prepare legend config without shortening when everything fits', () => {
            const expectedResult = {
                classes: ['viz-legend', 'heatmap-legend', null, null],
                labels,
                boxes
            };
            const result = getHeatmapLegendConfiguration(series, format, numericSymbols, false);

            expect(result).toEqual(expectedResult);
        });

        it('should prepare small legend config without shortening when everything fits', () => {
            const expectedResult = {
                classes: ['viz-legend', 'heatmap-legend', 'small', null],
                labels,
                boxes
            };
            const result = getHeatmapLegendConfiguration(series, format, numericSymbols, true);

            expect(result).toEqual(expectedResult);
        });

        it('should prepare legend config with shortening', () => {
            const expectedResult = {
                classes: ['viz-legend', 'heatmap-legend', null, 'shortened'],
                labels: shortenedLabels,
                boxes
            };
            const result = getHeatmapLegendConfiguration(seriesForShortening, format, numericSymbols, false);

            expect(result).toEqual(expectedResult);
        });

        it('should prepare small legend config with shortening', () => {
            const expectedResult = {
                classes: ['viz-legend', 'heatmap-legend', 'small', 'shortened'],
                labels: shortenedLabels,
                boxes
            };
            const result = getHeatmapLegendConfiguration(seriesForShortening, format, numericSymbols, true);

            expect(result).toEqual(expectedResult);
        });
    });
});
