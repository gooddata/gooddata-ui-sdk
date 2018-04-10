// (C) 2007-2018 GoodData Corporation
import {
    calculateFluidLegend,
    calculateStaticLegend,
    ITEM_HEIGHT,
    RESPONSIVE_ITEM_MIN_WIDTH,
    LEGEND_PADDING,
    getLegendConfig
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
            const config = getLegendConfig({}, true, [], () => {});
            expect(config.position).toEqual(RIGHT);
            expect(config.enabled).toEqual(true);
        });

        it('should be able to override defaults', () => {
            const config = getLegendConfig({
                position: TOP,
                enabled: false
            }, true, [], () => {});
            expect(config.position).toEqual(TOP);
            expect(config.enabled).toEqual(false);
        });
    });
});
