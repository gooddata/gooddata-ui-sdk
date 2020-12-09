// (C) 2019-2020 GoodData Corporation
import {
    MAX_METRICS_COUNT,
    DEFAULT_PIE_METRICS_COUNT,
    DEFAULT_TREEMAP_MEASURES_COUNT,
    MAX_CATEGORIES_COUNT,
    MAX_STACKS_COUNT,
    MAX_VIEW_COUNT,
    MAX_FILTERS_COUNT,
    MAX_TABLE_CATEGORIES_COUNT,
    DEFAULT_HEADLINE_METRICS_COUNT,
    DEFAULT_XIRR_METRICS_COUNT,
    DEFAULT_XIRR_ATTRIBUTES_COUNT,
} from "../../constants/uiConfig";

import { METRIC, FACT, ATTRIBUTE, DATE } from "../../constants/bucket";

import {
    IExportUiConfig,
    INoMetricUiConfig,
    IOpenAsReportUiConfig,
    IUiConfig,
} from "../../interfaces/Visualization";
import { OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";

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

const secondaryMeasuresBase = {
    ...measuresBase,
    isShowOnSecondaryAxisVisible: true,
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
const allOverTimeComparisonTypes: OverTimeComparisonType[] = [
    OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
    OverTimeComparisonTypes.PREVIOUS_PERIOD,
];

const disabledExportConfig: IExportUiConfig = {
    supported: false,
};

const enabledExportConfig: IExportUiConfig = {
    supported: true,
};

const enabledNoMetricConfig: INoMetricUiConfig = {
    supported: true,
};

const disabledOpenAsReportConfig: IOpenAsReportUiConfig = {
    supported: false,
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

const attributeBase = {
    accepts: [ATTRIBUTE, DATE],
    itemsLimit: MAX_TABLE_CATEGORIES_COUNT,
    itemsLimitByType: {
        date: 1,
    },
    allowsReordering: true,
    allowsSwapping: false,
    enabled: true,
    canAddItems: true,
    isShowInPercentEnabled: false,
    title: "Attributes",
    icon: "",
};

const defaultUiConfigNoRecommendations = {
    recommendations: {},
    supportedOverTimeComparisonTypes: noSupportedOverTimeComparisonTypes,
    exportConfig: enabledExportConfig,
    openAsReport: enabledOpenAsReportConfig,
};

const defaultUiConfig = {
    ...defaultRecommendations,
    supportedOverTimeComparisonTypes: noSupportedOverTimeComparisonTypes,
    exportConfig: enabledExportConfig,
    openAsReport: enabledOpenAsReportConfig,
};

export const simpleStackedBaseUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            canAddItems: false,
            // tslint:disable-next-line:max-line-length
            warningMessage:
                'To add additional measure, remove <span class="attr-field-icon"></span> from <span class="stack-by">stack by</span>',
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

export const multipleMetricsAndCategoriesLineUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...secondaryMeasuresBase,
        },
        trend: {
            ...viewBase,
            title: "Trend by",
        },
        segment: {
            ...stackBase,
            canAddItems: false,
            warningMessage: "To segment by, an insight can have only one measure",
            title: "Segment by",
        },
        filters: {
            ...filtersBase,
        },
    },
    ...defaultUiConfigNoRecommendations,
    supportedOverTimeComparisonTypes: allOverTimeComparisonTypes,
};

export const multipleMetricsAndCategoriesAreaUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
        },
        view: {
            ...viewBase,
            title: "View by",
        },
        stack: {
            ...stackBase,
            canAddItems: false,
            warningMessage: "To stack by, an insight can have only one measure",
            title: "Stack by",
        },
        filters: {
            ...filtersBase,
        },
    },
    recommendations: {},
    supportedOverTimeComparisonTypes: noSupportedOverTimeComparisonTypes,
    exportConfig: enabledExportConfig,
    openAsReport: disabledOpenAsReportConfig,
};

export const multipleMesuresAndCategoriesAreaUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
        },
        view: {
            ...viewBase,
            allowsReordering: true,
            itemsLimit: MAX_VIEW_COUNT,
            canAddItems: false,
            warningMessage: "To view by another attribute, an insight can have only one measure",
        },
        stack: {
            ...stackBase,
            canAddItems: false,
            warningMessage: "To stack by an attribute, an insight can have only one measure",
        },
        filters: {
            ...filtersBase,
        },
    },
    recommendations: {},
    supportedOverTimeComparisonTypes: noSupportedOverTimeComparisonTypes,
    exportConfig: enabledExportConfig,
    openAsReport: enabledOpenAsReportConfig,
    optionalStacking: {
        supported: true,
        stackMeasures: true,
    },
};

export const multipleMetricsBaseUiConfig: IUiConfig = {
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
    recommendations: {},
    openAsReport: disabledOpenAsReportConfig,
};

export const multipleMetricsAndCategoriesPieUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            itemsLimit: DEFAULT_PIE_METRICS_COUNT,
            isShowInPercentEnabled: true,
            allowsReordering: false,
        },
        view: {
            ...viewBase,
        },
        filters: {
            ...filtersBase,
        },
    },
    ...defaultUiConfigNoRecommendations,
};

export const scatterPlotUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            isShowInPercentVisible: false,
            isShowInPercentEnabled: false,
            allowsReordering: false,
            canAddItems: true,
            title: "Measure",
            subtitle: "X-axis",
            itemsLimit: 1,
        },
        secondary_measures: {
            ...measuresBase,
            isShowInPercentVisible: false,
            isShowInPercentEnabled: false,
            allowsReordering: false,
            canAddItems: true,
            title: "Measure",
            subtitle: "Y-axis",
            itemsLimit: 1,
        },
        attribute: {
            ...attributeBase,
            title: "Attribute",
            allowsReordering: false,
            allowsSwapping: false,
            canAddItems: true,
            itemsLimit: MAX_STACKS_COUNT,
        },
        filters: {
            ...filtersBase,
        },
    },
    recommendations: {},
    exportConfig: enabledExportConfig,
    openAsReport: disabledOpenAsReportConfig,
    supportedOverTimeComparisonTypes: noSupportedOverTimeComparisonTypes,
};

export const bubbleChartUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            isShowInPercentVisible: false,
            isShowInPercentEnabled: false,
            allowsReordering: false,
            canAddItems: true,
            title: "Measure",
            subtitle: "X-axis",
            itemsLimit: 1,
        },
        secondary_measures: {
            ...measuresBase,
            isShowInPercentVisible: false,
            isShowInPercentEnabled: false,
            allowsReordering: false,
            canAddItems: true,
            title: "Measure",
            subtitle: "Y-axis",
            itemsLimit: 1,
        },
        tertiary_measures: {
            ...measuresBase,
            isShowInPercentVisible: false,
            isShowInPercentEnabled: false,
            allowsReordering: false,
            canAddItems: true,
            title: "Measure",
            subtitle: "Size",
            itemsLimit: 1,
        },
        view: {
            ...attributeBase,
            allowsReordering: false,
            allowsSwapping: false,
            canAddItems: true,
            title: "View by",
            itemsLimit: 1,
            itemsLimitByType: {
                date: 1,
            },
        },
        filters: {
            ...filtersBase,
        },
    },
    recommendations: {},
    exportConfig: enabledExportConfig,
    openAsReport: disabledOpenAsReportConfig,
    supportedOverTimeComparisonTypes: noSupportedOverTimeComparisonTypes,
};

export const multipleMetricsAndCategoriesDonutUiConfig: IUiConfig = {
    ...multipleMetricsAndCategoriesPieUiConfig,
    openAsReport: disabledOpenAsReportConfig,
};

export const multipleMetricsAndCategoriesTableUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
        },
        attribute: {
            ...attributeBase,
        },
        filters: {
            ...filtersBase,
        },
    },
    ...defaultUiConfigNoRecommendations,
    supportedOverTimeComparisonTypes: allOverTimeComparisonTypes,
};

export const oneMetricNoCategoriesPieUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
        },
        view: {
            ...viewBase,
        },
        filters: {
            ...filtersBase,
        },
    },
    ...defaultUiConfigNoRecommendations,
};

export const oneMetricNoCategoriesDonutUiConfig: IUiConfig = {
    ...oneMetricNoCategoriesPieUiConfig,
    openAsReport: disabledOpenAsReportConfig,
};

export const oneMetricNoCategoriesBaseUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
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
    ...defaultColumnRecommendations,
};

export const multipleMeasuresAndCategoriesTreemapUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            itemsLimit: DEFAULT_TREEMAP_MEASURES_COUNT,
            isShowInPercentEnabled: false,
            allowsReordering: false,
            canAddItems: false,
            // tslint:disable-next-line:max-line-length
            warningMessage:
                'To add additional measure, remove <span class="attr-field-icon"></span> from <span class="stack-by">view by</span>',
        },
        view: {
            ...viewBase,
        },
        segment: {
            ...stackBase,
            title: "Segment by",
        },
        filters: {
            ...filtersBase,
        },
    },
    ...defaultUiConfigNoRecommendations,
    openAsReport: disabledOpenAsReportConfig,
};

export const multipleMeasuresNoCategoriesTreemapUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
        },
        view: {
            ...viewBase,
            canAddItems: false,
            itemsLimit: 0,
            warningMessage: "To view by, an insight can have only one measure",
        },
        segment: {
            ...stackBase,
            title: "Segment by",
        },
        filters: {
            ...filtersBase,
        },
    },
    ...defaultUiConfigNoRecommendations,
    openAsReport: disabledOpenAsReportConfig,
};

export const oneMeasureNoCategoriesTreemapUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
        },
        view: {
            ...viewBase,
        },
        segment: {
            ...stackBase,
            title: "Segment by",
        },
        filters: {
            ...filtersBase,
        },
    },
    ...defaultUiConfigNoRecommendations,
    openAsReport: disabledOpenAsReportConfig,
};

export const multipleMetricsOneStackByUiConfig: IUiConfig = {
    ...multipleMeasuresNoCategoriesTreemapUiConfig,
};

export const oneMetricAndManyCategoriesBaseUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            canAddItems: false,
            // tslint:disable-next-line:max-line-length
            warningMessage:
                'To add additional measure, remove <span class="attr-field-icon"></span> from <span class="stack-by">stack by</span>',
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

export const oneMetricAndManyCategoriesBarUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...secondaryMeasuresBase,
            isShowInPercentEnabled: true,
        },
        view: {
            ...viewBase,
            allowsReordering: true,
            itemsLimit: MAX_VIEW_COUNT,
        },
        stack: {
            ...stackBase,
        },
        filters: {
            ...filtersBase,
        },
    },
    recommendations: {},
    supportedOverTimeComparisonTypes: allOverTimeComparisonTypes,
    exportConfig: enabledExportConfig,
    openAsReport: enabledOpenAsReportConfig,
    optionalStacking: {
        supported: true,
        stackMeasures: false,
    },
};

export const oneMetricAndOneStackBarUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...secondaryMeasuresBase,
            canAddItems: false,
            // tslint:disable-next-line:max-line-length
            warningMessage:
                'To add additional measure, remove <span class="attr-field-icon"></span> from <span class="stack-by">stack by</span>',
            title: "Measures",
        },
        view: {
            ...viewBase,
            allowsReordering: true,
            itemsLimit: MAX_VIEW_COUNT,
        },
        stack: {
            ...stackBase,
        },
        filters: {
            ...filtersBase,
        },
    },
    recommendations: {},
    supportedOverTimeComparisonTypes: allOverTimeComparisonTypes,
    exportConfig: enabledExportConfig,
    openAsReport: enabledOpenAsReportConfig,
    optionalStacking: {
        supported: true,
        stackMeasures: false,
    },
};

export const multipleMetricsAndCategoriesBarUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...secondaryMeasuresBase,
        },
        view: {
            ...viewBase,
            allowsReordering: true,
            itemsLimit: MAX_VIEW_COUNT,
        },
        stack: {
            ...stackBase,
            canAddItems: false,
            warningMessage: "To stack by an attribute, an insight can have only one measure",
        },
        filters: {
            ...filtersBase,
        },
    },
    recommendations: {},
    supportedOverTimeComparisonTypes: allOverTimeComparisonTypes,
    exportConfig: enabledExportConfig,
    openAsReport: enabledOpenAsReportConfig,
    optionalStacking: {
        supported: true,
        stackMeasures: false,
    },
};

export const oneMetricAndManyCategoriesColumnUiConfig: IUiConfig = {
    ...oneMetricAndManyCategoriesBarUiConfig,
    ...defaultRecommendations,
};

export const oneMetricAndOneStackColumnUiConfig: IUiConfig = {
    ...oneMetricAndOneStackBarUiConfig,
    ...defaultRecommendations,
};

export const oneStackAndNoCategoryColumnUiConfig: IUiConfig = {
    ...oneMetricAndOneStackBarUiConfig,
    ...defaultColumnRecommendations,
    supportedOverTimeComparisonTypes: allOverTimeComparisonTypes,
};

export const multipleMetricsAndCategoriesColumnUiConfig: IUiConfig = {
    ...multipleMetricsAndCategoriesBarUiConfig,
    ...defaultRecommendations,
};

export const oneMetricAndManyCategoriesLineUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...secondaryMeasuresBase,
            canAddItems: false,
            // tslint:disable-next-line:max-line-length
            warningMessage:
                'To add additional measure, remove <span class="attr-field-icon"></span> from <span class="stack-by">segment by</span>',
            title: "Measures",
        },
        trend: {
            ...viewBase,
            title: "Trend by",
        },
        segment: {
            ...stackBase,
            title: "Segment by",
        },
        filters: {
            ...filtersBase,
        },
    },
    ...defaultUiConfigNoRecommendations,
    supportedOverTimeComparisonTypes: allOverTimeComparisonTypes,
};

export const oneMetricAndManyCategoriesAreaUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            canAddItems: false,
            // tslint:disable-next-line:max-line-length
            warningMessage:
                'To add additional measure, remove <span class="attr-field-icon"></span> from <span class="stack-by">stack by</span>',
            title: "Measures",
        },
        view: {
            ...viewBase,
            allowsReordering: true,
            itemsLimit: MAX_VIEW_COUNT,
        },
        stack: {
            ...stackBase,
            title: "Stack by",
        },
        filters: {
            ...filtersBase,
        },
    },
    recommendations: {},
    supportedOverTimeComparisonTypes: noSupportedOverTimeComparisonTypes,
    exportConfig: enabledExportConfig,
    openAsReport: enabledOpenAsReportConfig,
    optionalStacking: {
        supported: true,
        stackMeasures: true,
    },
};

export const oneMetricManyCategoriesAreaUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            canAddItems: false,
            isShowInPercentEnabled: true,
            // tslint:disable-next-line:max-line-length
            warningMessage:
                'To add additional measure, remove <span class="attr-field-icon"></span> from <span class="stack-by">view by</span>',
        },
        view: {
            ...viewBase,
            allowsReordering: true,
            itemsLimit: MAX_VIEW_COUNT,
        },
        stack: {
            ...stackBase,
            canAddItems: false,
            warningMessage: "To stack by, an insight can have only one attribute in view by",
        },
        filters: {
            ...filtersBase,
        },
    },
    recommendations: {},
    supportedOverTimeComparisonTypes: noSupportedOverTimeComparisonTypes,
    exportConfig: enabledExportConfig,
    openAsReport: enabledOpenAsReportConfig,
    optionalStacking: {
        supported: true,
        stackMeasures: true,
    },
};

export const oneMetricAndOneCategoryAndOneStackAreaUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            canAddItems: false,
            // tslint:disable-next-line:max-line-length
            warningMessage:
                'To add additional measure, remove <span class="attr-field-icon"></span> from <span class="stack-by">stack by</span>',
        },
        view: {
            ...viewBase,
            canAddItems: false,
            allowsReordering: true,
            itemsLimit: MAX_VIEW_COUNT,
            // tslint:disable-next-line:max-line-length
            warningMessage:
                'To add additional attribute, remove <span class="attr-field-icon"></span> from <span class="stack-by">stack by</span>',
        },
        stack: {
            ...stackBase,
            title: "Stack by",
        },
        filters: {
            ...filtersBase,
        },
    },
    recommendations: {},
    supportedOverTimeComparisonTypes: noSupportedOverTimeComparisonTypes,
    exportConfig: enabledExportConfig,
    openAsReport: enabledOpenAsReportConfig,
    optionalStacking: {
        supported: true,
        stackMeasures: true,
    },
};

export const multipleMetricsNoCategoriesPieUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
        },
        view: {
            ...viewBase,
            canAddItems: false,
            itemsLimit: 0,
            warningMessage: "To view by, an insight can have only one measure",
        },
        filters: {
            ...filtersBase,
        },
    },
    ...defaultUiConfigNoRecommendations,
};

export const multipleMetricsNoCategoriesDonutUiConfig: IUiConfig = {
    ...multipleMetricsNoCategoriesPieUiConfig,
    openAsReport: disabledOpenAsReportConfig,
};

export const dateAsFirstCategoryBaseUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            canAddItems: false,
            // tslint:disable-next-line:max-line-length
            warningMessage:
                'To add additional measure, remove <span class="attr-field-icon"></span> from <span class="stack-by">stack by</span>',
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

export const dateAsSecondCategoryBaseUiConfig: IUiConfig = dateAsFirstCategoryBaseUiConfig;

export const dateAsSecondCategoryLineUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...secondaryMeasuresBase,
            canAddItems: false,
            // tslint:disable-next-line:max-line-length
            warningMessage:
                'To add additional measure, remove <span class="attr-field-icon"></span> from <span class="stack-by">segment by</span>',
        },
        trend: {
            ...viewBase,
            title: "Trend by",
        },
        segment: {
            ...stackBase,
            title: "Segment by",
        },
        filters: {
            ...filtersBase,
        },
    },
    ...defaultUiConfigNoRecommendations,
    supportedOverTimeComparisonTypes: allOverTimeComparisonTypes,
};

export const dateAsSecondCategoryAreaUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            isShowInPercentEnabled: true,
        },
        view: {
            ...viewBase,
            title: "View by",
        },
        stack: {
            ...stackBase,
            title: "Stack by",
        },
        filters: {
            ...filtersBase,
        },
    },
    recommendations: {},
    supportedOverTimeComparisonTypes: noSupportedOverTimeComparisonTypes,
    exportConfig: enabledExportConfig,
    openAsReport: disabledOpenAsReportConfig,
};

export const dateAsThirdCategoryAreaUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            canAddItems: false,
            isShowInPercentEnabled: true,
            // tslint:disable-next-line:max-line-length
            warningMessage:
                'To add additional measure, remove <span class="attr-field-icon"></span> from <span class="stack-by">view by</span>',
        },
        view: {
            ...viewBase,
            canAddItems: true,
            allowsReordering: true,
            itemsLimit: MAX_VIEW_COUNT,
        },
        stack: {
            ...stackBase,
            canAddItems: false,
            warningMessage: "To stack by, an insight can have only one attribute in view by",
        },
        filters: {
            ...filtersBase,
        },
    },
    recommendations: {},
    supportedOverTimeComparisonTypes: noSupportedOverTimeComparisonTypes,
    exportConfig: enabledExportConfig,
    openAsReport: enabledOpenAsReportConfig,
    optionalStacking: {
        supported: true,
        stackMeasures: true,
    },
};

export const multipleAttributesBaseUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            canAddItems: false,
            // tslint:disable-next-line:max-line-length
            warningMessage:
                'To add additional measure, remove <span class="attr-field-icon"></span> from <span class="stack-by">stack by</span>',
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

export const oneMetricAndCategoryAndStackLineUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...secondaryMeasuresBase,
            canAddItems: false,
            // tslint:disable-next-line:max-line-length
            warningMessage:
                'To add additional measure, remove <span class="attr-field-icon"></span> from <span class="stack-by">segment by</span>',
        },
        trend: {
            ...viewBase,
            title: "Trend by",
        },
        segment: {
            ...stackBase,
            title: "Segment by",
        },
        filters: {
            ...filtersBase,
        },
    },
    ...defaultUiConfigNoRecommendations,
    supportedOverTimeComparisonTypes: allOverTimeComparisonTypes,
};

export const oneStackAndNoCategoriesLineUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...secondaryMeasuresBase,
            canAddItems: false,
            // tslint:disable-next-line:max-line-length
            warningMessage:
                'To add additional measure, remove <span class="attr-field-icon"></span> from <span class="stack-by">segment by</span>',
        },
        trend: {
            ...viewBase,
            title: "Trend by",
        },
        segment: {
            ...stackBase,
            title: "Segment by",
        },
        filters: {
            ...filtersBase,
        },
    },
    ...defaultUiConfigNoRecommendations,
    supportedOverTimeComparisonTypes: allOverTimeComparisonTypes,
};

export const oneStackAndNoCategoriesAreaUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            canAddItems: false,
            // tslint:disable-next-line:max-line-length
            warningMessage:
                'To add additional measure, remove <span class="attr-field-icon"></span> from <span class="stack-by">stack by</span>',
        },
        view: {
            ...viewBase,
            allowsReordering: true,
            itemsLimit: MAX_VIEW_COUNT,
        },
        stack: {
            ...stackBase,
            title: "Stack by",
        },
        filters: {
            ...filtersBase,
        },
    },
    recommendations: {},
    supportedOverTimeComparisonTypes: noSupportedOverTimeComparisonTypes,
    exportConfig: enabledExportConfig,
    openAsReport: enabledOpenAsReportConfig,
    optionalStacking: {
        supported: true,
        stackMeasures: true,
    },
};

export const simpleStackedTableUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            isShowInPercentEnabled: true,
        },
        attribute: {
            ...attributeBase,
        },
        filters: {
            ...filtersBase,
        },
    },
    ...defaultUiConfigNoRecommendations,
    supportedOverTimeComparisonTypes: allOverTimeComparisonTypes,
};

export const sameCategoryAndStackTableUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            isShowInPercentEnabled: true,
        },
        attribute: {
            ...attributeBase,
        },
        filters: {
            ...filtersBase,
        },
    },
    ...defaultUiConfigNoRecommendations,
    supportedOverTimeComparisonTypes: allOverTimeComparisonTypes,
};

export const tableTotalsUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
        },
        attribute: {
            ...attributeBase,
        },
        filters: {
            ...filtersBase,
        },
    },
    ...defaultUiConfigNoRecommendations,
    supportedOverTimeComparisonTypes: allOverTimeComparisonTypes,
};

export const oneMetricHeadlineUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            itemsLimit: DEFAULT_HEADLINE_METRICS_COUNT,
            isShowInPercentEnabled: false,
            isShowInPercentVisible: false,
            allowsReordering: false,
            canAddItems: false,
            title: "Measure",
            subtitle: "primary",
        },
        secondary_measures: {
            ...measuresBase,
            itemsLimit: DEFAULT_HEADLINE_METRICS_COUNT,
            isShowInPercentEnabled: false,
            isShowInPercentVisible: false,
            allowsReordering: false,
            canAddItems: false,
            title: "Measure",
            subtitle: "secondary",
        },
        filters: {
            ...filtersBase,
            isShowInPercentEnabled: false,
        },
    },
    ...defaultUiConfigNoRecommendations,
    exportConfig: disabledExportConfig,
    openAsReport: disabledOpenAsReportConfig,
    supportedOverTimeComparisonTypes: allOverTimeComparisonTypes,
};

export const defaultHeatmapUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            allowsReordering: false,
            isShowInPercentVisible: false,
            itemsLimit: 1,
            title: "Measure",
        },
        stack: {
            ...stackBase,
            accepts: [ATTRIBUTE, DATE],
            title: "Columns",
            canAddItems: true,
            icon: "",
        },
        view: {
            ...stackBase,
            accepts: [ATTRIBUTE, DATE],
            title: "Rows",
        },
        filters: {
            accepts: [ATTRIBUTE, DATE],
            itemsLimit: MAX_FILTERS_COUNT,
            itemsLimitByType: {
                date: 1,
            },
            allowsReordering: false,
            enabled: true,
            isShowInPercentEnabled: false,
        },
    },
    recommendations: {},
    exportConfig: enabledExportConfig,
    openAsReport: disabledOpenAsReportConfig,
    supportedOverTimeComparisonTypes: noSupportedOverTimeComparisonTypes,
};

export const defaultPivotTableUiConfig: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            title: "Measures",
        },
        attribute: {
            ...attributeBase,
            allowsDuplicateDates: false,
            allowsSwapping: true,
            title: "Rows",
        },
        columns: {
            ...attributeBase,
            allowsDuplicateDates: false,
            allowsSwapping: true,
            title: "Columns",
        },
        filters: {
            accepts: [ATTRIBUTE, DATE],
            itemsLimit: MAX_FILTERS_COUNT,
            itemsLimitByType: {
                date: 1,
            },
            allowsReordering: false,
            enabled: true,
            isShowInPercentEnabled: false,
        },
    },
    recommendations: {},
    exportConfig: enabledExportConfig,
    openAsReport: disabledOpenAsReportConfig,
    supportedOverTimeComparisonTypes: allOverTimeComparisonTypes,
};

export const fullySpecifiedXirrUiConfig: IUiConfig = {
    buckets: {
        measures: {
            accepts: [METRIC, FACT],
            allowsDuplicateItems: true,
            enabled: true,
            allowsReordering: true,
            allowsSwapping: true,
            itemsLimit: DEFAULT_XIRR_METRICS_COUNT,
            isShowInPercentEnabled: false,
            isShowInPercentVisible: false,
            title: "Measure",
            canAddItems: false,
        },
        filters: {
            accepts: [ATTRIBUTE, DATE],
            itemsLimit: MAX_FILTERS_COUNT,
            itemsLimitByType: {
                date: 1,
            },
            allowsReordering: false,
            enabled: true,
            isShowInPercentEnabled: false,
        },
        attribute: {
            accepts: [DATE],
            itemsLimit: DEFAULT_XIRR_ATTRIBUTES_COUNT,
            itemsLimitByType: {
                date: 1,
            },
            allowsSwapping: true,
            allowsReordering: false,
            enabled: true,
            isShowInPercentEnabled: false,
            title: "Date attribute",
            canAddItems: false,
        },
    },
    recommendations: {},
    exportConfig: disabledExportConfig,
    openAsReport: disabledOpenAsReportConfig,
    supportedOverTimeComparisonTypes: [],
};

export const defaultGeoPushpinUiConfig: IUiConfig = {
    buckets: {
        location: {
            accepts: ["attribute", "geo_attribute"],
            allowsReordering: false,
            allowsSwapping: true,
            enabled: true,
            icon: "",
            isShowInPercentEnabled: false,
            canAddItems: true,
            itemsLimit: 1,
            itemsLimitByType: {
                date: 1,
            },
            title: "Location",
        },
        size: {
            accepts: ["metric", "fact", "attribute"],
            allowsDuplicateItems: true,
            allowsReordering: false,
            allowsSwapping: true,
            enabled: true,
            icon: "",
            isShowInPercentEnabled: false,
            isShowInPercentVisible: false,
            itemsLimit: 1,
            subtitle: "Size",
            title: "Measure",
            canAddItems: true,
        },
        color: {
            accepts: ["metric", "fact", "attribute"],
            allowsDuplicateItems: true,
            allowsReordering: false,
            allowsSwapping: true,
            enabled: true,
            icon: "",
            isShowInPercentEnabled: false,
            isShowInPercentVisible: false,
            itemsLimit: 1,
            subtitle: "Color",
            title: "Measure",
            canAddItems: true,
        },
        segment: {
            accepts: ["attribute"],
            allowsReordering: false,
            allowsSwapping: true,
            enabled: true,
            icon: "",
            isShowInPercentEnabled: false,
            canAddItems: true,
            itemsLimit: 1,
            itemsLimitByType: {
                date: 1,
            },
            title: "Segment by",
        },
        filters: {
            accepts: ["attribute", "date"],
            allowsReordering: false,
            enabled: true,
            isShowInPercentEnabled: false,
            itemsLimit: 20,
            itemsLimitByType: {
                date: 1,
            },
        },
    },
    exportConfig: enabledExportConfig,
    noMetricAccepted: enabledNoMetricConfig,
    openAsReport: disabledOpenAsReportConfig,
    recommendations: {},
    supportedOverTimeComparisonTypes: noSupportedOverTimeComparisonTypes,
    supportedLocationIcon: { supported: true },
};
