// (C) 2021-2025 GoodData Corporation
import { IVisualizationDefaultSizeInfo } from "../../interfaces/VisualizationDescriptor.js";

export const DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT = 22.5;
export const DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT = 12;
/**
 * @internal
 */
export const DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT_PX = 450;

export const MAX_VISUALIZATION_HEIGHT = 40;
export const MAX_NEW_VISUALIZATION_HEIGHT = 2000;
export const MIN_VISUALIZATION_HEIGHT = 12;
export const MIN_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT = 6;
export const MIN_VISUALIZATION_HEIGHT_TABLE_FLEXIBLE_LAYOUT = 7;
export const MIDDLE_VISUALIZATION_HEIGHT = 22;
export const MIDDLE_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT = 17;
/**
 * @internal
 */
export const MIN_VISUALIZATION_WIDTH = 2;
export const MIN_RICH_TEXT_WIDTH = 1;

/**
 * @internal
 */
export const INSIGHT_WIDGET_SIZE_INFO_DEFAULT_LEGACY: IVisualizationDefaultSizeInfo = {
    width: {
        min: MIN_VISUALIZATION_WIDTH,
        default: 6,
    },
    height: {
        default: DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    },
};

/**
 * @internal
 */
export const INSIGHT_WIDGET_SIZE_INFO_DEFAULT: IVisualizationDefaultSizeInfo = {
    width: {
        min: MIN_VISUALIZATION_WIDTH,
        default: 6,
    },
    height: {
        default: 22,
        min: 22,
        max: 40,
    },
};

/**
 * @internal
 */
export const INSIGHT_WIDGET_SIZE_INFO_NEW_DEFAULT: IVisualizationDefaultSizeInfo = {
    width: {
        min: MIN_VISUALIZATION_WIDTH,
        default: 4,
    },
    height: {
        default: MIDDLE_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT,
        min: MIDDLE_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT,
        max: MAX_NEW_VISUALIZATION_HEIGHT,
    },
};

/**
 * @internal
 */
export const RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT: IVisualizationDefaultSizeInfo = {
    width: {
        min: MIN_RICH_TEXT_WIDTH,
        default: 6,
    },
    height: {
        default: 22,
        min: 2,
        max: 40,
    },
};

/**
 * @internal
 */
export const RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT: IVisualizationDefaultSizeInfo = {
    width: {
        min: MIN_RICH_TEXT_WIDTH,
        default: 4,
    },
    height: {
        default: 22,
        min: 2,
        max: MAX_NEW_VISUALIZATION_HEIGHT,
    },
};

/**
 * @internal
 */
export const VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT: IVisualizationDefaultSizeInfo = {
    width: {
        min: MIN_VISUALIZATION_WIDTH,
        default: 6,
    },
    height: {
        default: 22,
        min: 12,
        max: 40,
    },
};

/**
 * @internal
 */
export const VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_NEW_DEFAULT: IVisualizationDefaultSizeInfo = {
    width: {
        min: MIN_VISUALIZATION_WIDTH,
        default: 4,
    },
    height: {
        default: 22,
        min: 12,
        max: MAX_NEW_VISUALIZATION_HEIGHT,
    },
};

/**
 * @internal
 */
export const DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT: IVisualizationDefaultSizeInfo = {
    width: {
        min: MIN_VISUALIZATION_WIDTH,
        default: 4,
    },
    height: {
        default: MIDDLE_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT,
        min: 12,
        max: MAX_NEW_VISUALIZATION_HEIGHT,
    },
};

/**
 * @internal
 */
export const KPI_WIDGET_SIZE_INFO_DEFAULT_LEGACY: IVisualizationDefaultSizeInfo = {
    width: {
        min: MIN_VISUALIZATION_WIDTH,
        default: 2,
    },
    height: {
        default: DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT,
        min: DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT,
        max: DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT,
    },
};

/**
 * @internal
 */
export const KPI_WIDGET_SIZE_INFO_DEFAULT: IVisualizationDefaultSizeInfo = {
    width: {
        min: MIN_VISUALIZATION_WIDTH,
        default: 2,
    },
    height: {
        default: 11,
        min: 9,
        max: 40,
    },
};

/**
 * @internal
 */
export const WIDGET_DROPZONE_SIZE_INFO_DEFAULT = KPI_WIDGET_SIZE_INFO_DEFAULT;
