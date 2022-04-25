// (C) 2019-2022 GoodData Corporation
import {
    MAX_METRICS_COUNT,
    MAX_CATEGORIES_COUNT,
    MAX_STACKS_COUNT,
    MAX_FILTERS_COUNT,
} from "../../constants/uiConfig";

import { METRIC, FACT, ATTRIBUTE, DATE } from "../../constants/bucket";

import { IExportUiConfig, IOpenAsReportUiConfig, IUiConfig } from "../../interfaces/Visualization";
import { OverTimeComparisonType } from "@gooddata/sdk-ui";

const measuresBase = {
    accepts: [METRIC, FACT, ATTRIBUTE],
    allowsDuplicateItems: true,
    enabled: true,
    allowsReordering: true,
    allowsSwapping: true,
    itemsLimit: MAX_METRICS_COUNT,
    isShowInPercentEnabled: false,
    isShowInPercentVisible: true,
    canAddItems: true,
    title: "Measures",
    icon: "",
};

const viewBase = {
    accepts: [ATTRIBUTE, DATE],
    itemsLimit: MAX_CATEGORIES_COUNT,
    itemsLimitByType: {
        date: 1,
    },
    allowsSwapping: true,
    allowsReordering: false,
    enabled: true,
    canAddItems: true,
    isShowInPercentEnabled: false,
    title: "View by",
    icon: "",
};

const stackBase = {
    accepts: [ATTRIBUTE],
    itemsLimit: MAX_STACKS_COUNT,
    allowsSwapping: true,
    allowsReordering: false,
    enabled: true,
    isShowInPercentEnabled: false,
    canAddItems: true,
    title: "Stack by",
    icon: "",
};

const filtersBase = {
    accepts: [ATTRIBUTE, DATE],
    itemsLimit: MAX_FILTERS_COUNT,
    itemsLimitByType: {
        date: 1,
    },
    allowsReordering: false,
    enabled: true,
    isShowInPercentEnabled: false,
};

const noSupportedOverTimeComparisonTypes: OverTimeComparisonType[] = [];

const enabledExportConfig: IExportUiConfig = {
    supported: true,
};

const enabledOpenAsReportConfig: IOpenAsReportUiConfig = {
    supported: true,
};

export const defaultColumnRecommendations = {
    recommendations: {
        comparison: true,
        percent: false,
        overTimeComparison: false,
        previousPeriod: false,
        trending: true,
    },
    exportConfig: enabledExportConfig,
    openAsReport: enabledOpenAsReportConfig,
    supportedOverTimeComparisonTypes: noSupportedOverTimeComparisonTypes,
};

const defaultRecommendations = {
    recommendations: {
        comparison: false,
        percent: false,
        overTimeComparison: false,
        previousPeriod: false,
        trending: false,
    },
};

const defaultUiConfig = {
    ...defaultRecommendations,
    supportedOverTimeComparisonTypes: noSupportedOverTimeComparisonTypes,
    exportConfig: enabledExportConfig,
    openAsReport: enabledOpenAsReportConfig,
};

//
export const simpleStackedBaseUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            canAddItems: false,
            warningMessage:
                'To add additional measure, remove <span class="attr-field-icon" /> from <span class="stack-by">stack by</span>',
        },
        view: {
            ...viewBase,
        },
        stack: {
            ...stackBase,
        },
        filters: {
            ...filtersBase,
        },
    },
    ...defaultUiConfig,
};

//
export const multipleMetricsAndCategoriesBaseUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
        },
        view: {
            ...viewBase,
        },
        stack: {
            ...stackBase,
            canAddItems: false,
            warningMessage: "To stack by, an insight can have only one measure",
        },
        filters: {
            ...filtersBase,
        },
    },
    ...defaultUiConfig,
};
