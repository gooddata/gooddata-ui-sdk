// (C) 2007-2018 GoodData Corporation
import { RIGHT } from './PositionTypes';

export const RESPONSIVE_ITEM_MIN_WIDTH = 200;
export const RESPONSIVE_VISIBLE_ROWS = 2;
export const FLUID_PAGING_WIDTH = 30;
export const LEGEND_PADDING = 12;

export const ITEM_HEIGHT = 20;
const STATIC_PAGING_HEIGHT = 44;

export function calculateFluidLegend(seriesCount: any, containerWidth: any) {
    // -1 because flex dimensions provide rounded number and the real width can be float
    const realWidth = containerWidth - (2 * LEGEND_PADDING) - 1;

    if (seriesCount <= 2) {
        return {
            hasPaging: false,
            itemWidth: realWidth / seriesCount,
            visibleItemsCount: seriesCount
        };
    }

    let columnsCount = Math.floor(realWidth / RESPONSIVE_ITEM_MIN_WIDTH);
    let itemWidth = realWidth / columnsCount;
    let hasPaging = false;

    const rowsCount = Math.ceil(seriesCount / columnsCount);

    // Recalculate with paging
    if (rowsCount > RESPONSIVE_VISIBLE_ROWS) {
        const legendWidthWithPaging = realWidth - FLUID_PAGING_WIDTH;
        columnsCount = Math.floor(
            legendWidthWithPaging / RESPONSIVE_ITEM_MIN_WIDTH
        );
        itemWidth = legendWidthWithPaging / columnsCount;
        hasPaging = true;
    }

    const visibleItemsCount = columnsCount * RESPONSIVE_VISIBLE_ROWS;

    return {
        itemWidth,
        hasPaging,
        visibleItemsCount
    };
}

function getStaticVisibleItemsCount(containerHeight: any, withPaging: any = false) {
    const pagingHeight = withPaging ? STATIC_PAGING_HEIGHT : 0;
    return Math.floor((containerHeight - pagingHeight) / ITEM_HEIGHT);
}

export function calculateStaticLegend(seriesCount: any, containerHeight: any) {
    const visibleItemsCount = getStaticVisibleItemsCount(containerHeight);
    if (visibleItemsCount >= seriesCount) {
        return {
            hasPaging: false,
            visibleItemsCount
        };
    }
    return {
        hasPaging: true,
        visibleItemsCount: getStaticVisibleItemsCount(containerHeight, true)
    };
}

const DEFAULT_LEGEND_CONFIG = {
    enabled: true,
    position: RIGHT
};

export function getLegendConfig(userConfig: any, shouldBeEnabled: any, items: any, onItemClick: any) {
    const baseConfig = {
        ...DEFAULT_LEGEND_CONFIG,
        ...userConfig
    };
    return {
        ...baseConfig,
        enabled: baseConfig.enabled && shouldBeEnabled,
        onItemClick,
        items
    };
}
