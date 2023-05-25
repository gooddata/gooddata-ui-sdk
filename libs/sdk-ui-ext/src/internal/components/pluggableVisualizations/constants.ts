// (C) 2021-2022 GoodData Corporation
import { IVisualizationDefaultSizeInfo } from "../../interfaces/VisualizationDescriptor.js";

export const DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT = 22.5;
export const DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT = 12;
/**
 * @internal
 */
export const DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT_PX = 450;

export const MAX_VISUALIZATION_HEIGHT = 40;
export const MIN_VISUALIZATION_HEIGHT = 12;
export const MIDDLE_VISUALIZATION_HEIGHT = 22;

/**
 * @internal
 */
export const INSIGHT_WIDGET_SIZE_INFO_DEFAULT_LEGACY: IVisualizationDefaultSizeInfo = {
    width: {
        min: 4,
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
        min: 4,
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
export const KPI_WIDGET_SIZE_INFO_DEFAULT_LEGACY: IVisualizationDefaultSizeInfo = {
    width: {
        min: 2,
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
        min: 2,
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
