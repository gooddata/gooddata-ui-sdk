// (C) 2022 GoodData Corporation
import { IVisualizationSizeInfo } from "@gooddata/sdk-ui-ext";

export const KPI_WITHOUT_COMPARISON_SIZE_INFO: IVisualizationSizeInfo = {
    width: {
        min: 2,
        default: 2,
    },
    height: {
        default: 8,
        min: 6,
        max: 40,
    },
};

export const KPI_WITH_COMPARISON_SIZE_INFO: IVisualizationSizeInfo = {
    width: {
        min: 2,
        default: 2,
    },
    height: {
        default: 11,
        min: 10,
        max: 40,
    },
};
