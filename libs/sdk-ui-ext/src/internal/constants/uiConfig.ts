// (C) 2019-2024 GoodData Corporation
import { IUiConfig } from "../interfaces/Visualization.js";

import { METRIC, FACT, ATTRIBUTE, DATE, GEO_ATTRIBUTE } from "./bucket.js";
import { BucketNames, OverTimeComparisonTypes, VisualizationTypes } from "@gooddata/sdk-ui";

export const MAX_METRICS_COUNT = 40;
export const DEFAULT_PIE_METRICS_COUNT = 1;
export const DEFAULT_PIE_ONLY_MAX_METRICS_COUNT = 20;
export const DEFAULT_TREEMAP_MEASURES_COUNT = 1;
export const MAX_FILTERS_COUNT = 20;
export const MAX_CATEGORIES_COUNT = 1;
export const MAX_TABLE_CATEGORIES_COUNT = 20;
export const INCREASE_MAX_TABLE_MEASURE_ITEMS_LIMIT = 100;
export const INCREASE_MAX_TABLE_ATTRIBUTES_ITEMS_LIMIT = 50;
export const MAX_STACKS_COUNT = 1;
export const MAX_VIEW_COUNT = 2;
export const DEFAULT_HEADLINE_METRICS_COUNT = 1;
export const DEFAULT_XIRR_METRICS_COUNT = 1;
export const DEFAULT_XIRR_ATTRIBUTES_COUNT = 1;
const DEFAULT_GEO_ATTRIBUTES_COUNT = 1;
const DEFAULT_PUSHPIN_METRICS_COUNT = 1;

export const UICONFIG = "uiConfig";
export const RECOMMENDATIONS = "recommendations";
export const SUPPORTED_COMPARISON_TYPES = "supportedOverTimeComparisonTypes";
export const OPEN_AS_REPORT = "openAsReport";
export const SUPPORTED = "supported";
export const UICONFIG_AXIS = "uiConfig.axis";

export const measuresBase = {
    accepts: [METRIC, FACT, ATTRIBUTE],
    allowsDuplicateItems: true,
    enabled: true,
    allowsReordering: true,
    allowsSwapping: true,
    itemsLimit: MAX_METRICS_COUNT,
    isShowInPercentEnabled: false,
    isShowInPercentVisible: true,
};

export const viewBase = {
    accepts: [ATTRIBUTE, DATE],
    itemsLimit: MAX_CATEGORIES_COUNT,
    itemsLimitByType: {
        date: 1,
    },
    allowsSwapping: true,
    allowsReordering: false,
    enabled: true,
    isShowInPercentEnabled: false,
};

const stackBase = {
    accepts: [ATTRIBUTE],
    itemsLimit: MAX_STACKS_COUNT,
    allowsSwapping: true,
    allowsReordering: false,
    enabled: true,
    isShowInPercentEnabled: false,
};

const stackBaseWithDate = {
    ...stackBase,
    accepts: [ATTRIBUTE, DATE],
};

export const defaultFilters = {
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
};

const disabledExportConfig = {
    exportConfig: { supported: false },
};

const enabledExportConfig = {
    exportConfig: { supported: true },
};

const enabledNoMetricConfig = {
    noMetricAccepted: { supported: true },
};

export const disabledOpenAsReportConfig = {
    openAsReport: { supported: false },
};

const enabledOpenAsReportConfig = {
    openAsReport: { supported: true },
};

export const defaultRootUiConfigProperties: Partial<IUiConfig> = {
    recommendations: {},
    supportedOverTimeComparisonTypes: [],
    ...disabledOpenAsReportConfig,
    ...enabledExportConfig,
};

export const DEFAULT_SCATTERPLOT_UICONFIG: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            isShowInPercentVisible: false,
            allowsReordering: false,
            canAddItems: true,
            itemsLimit: 1,
        },
        secondary_measures: {
            ...measuresBase,
            isShowInPercentVisible: false,
            allowsReordering: false,
            canAddItems: true,
            itemsLimit: 1,
        },
        attribute: {
            ...viewBase,
            allowsReordering: false,
            allowsSwapping: false,
            canAddItems: true,
            itemsLimit: MAX_STACKS_COUNT,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
};

export const DEFAULT_BUBBLE_CHART_CONFIG: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            isShowInPercentVisible: false,
            allowsReordering: false,
            canAddItems: true,
            itemsLimit: 1,
        },
        secondary_measures: {
            ...measuresBase,
            isShowInPercentVisible: false,
            allowsReordering: false,
            canAddItems: true,
            itemsLimit: 1,
        },
        tertiary_measures: {
            ...measuresBase,
            isShowInPercentVisible: false,
            allowsReordering: false,
            canAddItems: true,
            itemsLimit: 1,
        },
        view: {
            ...viewBase,
            allowsReordering: false,
            allowsSwapping: false,
            canAddItems: true,
            itemsLimit: 1,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
};

export const DEFAULT_BASE_CHART_UICONFIG: IUiConfig = {
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
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
    ...enabledOpenAsReportConfig,
};

export const COLUMN_BAR_CHART_UICONFIG: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            isShowOnSecondaryAxisVisible: true,
        },
        view: {
            ...viewBase,
            allowsReordering: true,
            itemsLimit: MAX_VIEW_COUNT,
        },
        stack: {
            ...stackBase,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
    ...enabledOpenAsReportConfig,
    supportedOverTimeComparisonTypes: [
        OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        OverTimeComparisonTypes.PREVIOUS_PERIOD,
    ],
    optionalStacking: {
        supported: true,
        stackMeasures: false,
    },
};

export const COLUMN_BAR_CHART_UICONFIG_WITH_MULTIPLE_DATES: IUiConfig = {
    ...COLUMN_BAR_CHART_UICONFIG,
    buckets: {
        ...COLUMN_BAR_CHART_UICONFIG.buckets,
        view: {
            ...COLUMN_BAR_CHART_UICONFIG.buckets.view,
            itemsLimitByType: {
                date: 2,
            },
            allowsDuplicateDates: true,
            preferSynchronizedDates: true,
        },
        stack: {
            ...stackBaseWithDate,
            itemsLimitByType: {
                date: 1,
            },
            allowsDuplicateDates: true,
        },
    },
};

export const DEFAULT_LINE_UICONFIG: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            isShowOnSecondaryAxisVisible: true,
        },
        trend: {
            ...viewBase,
        },
        segment: {
            ...stackBase,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
    ...enabledOpenAsReportConfig,
    supportedOverTimeComparisonTypes: [
        OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        OverTimeComparisonTypes.PREVIOUS_PERIOD,
    ],
};

export const LINE_UICONFIG_WITH_MULTIPLE_DATES: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            isShowOnSecondaryAxisVisible: true,
        },
        trend: {
            ...viewBase,
            allowsDuplicateDates: true,
        },
        segment: {
            ...stackBaseWithDate,
            itemsLimitByType: {
                date: 1,
            },
            allowsDuplicateDates: true,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
    ...enabledOpenAsReportConfig,
    supportedOverTimeComparisonTypes: [
        OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        OverTimeComparisonTypes.PREVIOUS_PERIOD,
    ],
};

export const DEFAULT_AREA_UICONFIG: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
        },
        view: {
            ...viewBase,
            allowsReordering: true,
            itemsLimit: MAX_VIEW_COUNT,
        },
        stack: {
            ...stackBase,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
    ...enabledOpenAsReportConfig,
    optionalStacking: {
        supported: true,
        stackMeasures: true,
    },
};

export const AREA_UICONFIG_WITH_MULTIPLE_DATES: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
        },
        view: {
            ...viewBase,
            itemsLimitByType: {
                date: 2,
            },
            allowsReordering: true,
            itemsLimit: MAX_VIEW_COUNT,
            allowsDuplicateDates: true,
        },
        stack: {
            ...stackBaseWithDate,
            itemsLimitByType: {
                date: 1,
            },
            allowsDuplicateDates: true,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
    ...enabledOpenAsReportConfig,
    optionalStacking: {
        supported: true,
        stackMeasures: true,
    },
};

export const DEFAULT_PIE_UICONFIG: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            itemsLimit: DEFAULT_PIE_METRICS_COUNT,
            allowsReordering: false,
        },
        view: {
            ...viewBase,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
    ...enabledOpenAsReportConfig,
};

export const PIE_UICONFIG_WITH_MULTIPLE_METRICS: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            itemsLimit: DEFAULT_PIE_ONLY_MAX_METRICS_COUNT,
        },
        view: {
            ...viewBase,
            itemsLimit: 0,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
    ...enabledOpenAsReportConfig,
};

export const PIE_UICONFIG_WITH_ONE_METRIC: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            itemsLimit: DEFAULT_PIE_ONLY_MAX_METRICS_COUNT,
        },
        view: {
            ...viewBase,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
    ...enabledOpenAsReportConfig,
};

export const DEFAULT_WATERFALL_UICONFIG: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            itemsLimit: DEFAULT_PIE_METRICS_COUNT,
            allowsReordering: false,
            isTotalMeasureVisible: true,
            isTotalMeasureEnabled: false,
        },
        view: {
            ...viewBase,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
    ...enabledOpenAsReportConfig,
    optionalStacking: {
        supported: true,
        stackMeasures: false,
    },
};

export const WATERFALL_UICONFIG_WITH_ONE_METRIC: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            isTotalMeasureVisible: true,
            isTotalMeasureEnabled: false,
        },
        view: {
            ...viewBase,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
    ...enabledOpenAsReportConfig,
    optionalStacking: {
        supported: true,
        stackMeasures: false,
    },
};

export const WATERFALL_UICONFIG_WITH_MULTIPLE_METRICS: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            isTotalMeasureVisible: true,
            isTotalMeasureEnabled: true,
        },
        view: {
            ...viewBase,
            itemsLimit: 0,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
    ...enabledOpenAsReportConfig,
    optionalStacking: {
        supported: true,
        stackMeasures: false,
    },
};

export const DEFAULT_TREEMAP_UICONFIG: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
        },
        view: {
            ...viewBase,
        },
        segment: {
            ...stackBase,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
};

export const DEFAULT_TABLE_UICONFIG: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
        },
        attribute: {
            ...viewBase,
            allowsSwapping: false,
            allowsReordering: true,
            itemsLimit: MAX_TABLE_CATEGORIES_COUNT,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
    ...enabledOpenAsReportConfig,
    supportedOverTimeComparisonTypes: [
        OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        OverTimeComparisonTypes.PREVIOUS_PERIOD,
    ],
};

export const DEFAULT_HEADLINE_UICONFIG: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            itemsLimit: DEFAULT_HEADLINE_METRICS_COUNT,
            isShowInPercentVisible: false,
            allowsReordering: false,
        },
        secondary_measures: {
            ...measuresBase,
            itemsLimit: DEFAULT_HEADLINE_METRICS_COUNT,
            isShowInPercentVisible: false,
            allowsReordering: false,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
    ...disabledExportConfig,
    supportedOverTimeComparisonTypes: [
        OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        OverTimeComparisonTypes.PREVIOUS_PERIOD,
    ],
};

export const DEFAULT_HEATMAP_UICONFIG: IUiConfig = {
    buckets: {
        measures: {
            accepts: [METRIC, FACT, ATTRIBUTE],
            enabled: true,
            allowsReordering: false,
            allowsSwapping: true,
            itemsLimit: 1,
            isShowInPercentEnabled: false,
            isShowInPercentVisible: false,
            icon: "",
            canAddItems: true,
            allowsDuplicateItems: true,
        },
        view: {
            accepts: [ATTRIBUTE, DATE],
            itemsLimit: 1,
            allowsSwapping: true,
            allowsReordering: false,
            enabled: true,
            isShowInPercentEnabled: false,
            icon: "",
            canAddItems: true,
        },
        stack: {
            accepts: [ATTRIBUTE, DATE],
            itemsLimit: 1,
            allowsSwapping: true,
            allowsReordering: false,
            enabled: true,
            isShowInPercentEnabled: false,
            icon: "",
            canAddItems: true,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
};

export const COMBO_CHART_UICONFIG_DEPRECATED: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
        },
        secondary_measures: {
            ...measuresBase,
        },
        view: {
            ...viewBase,
            itemsLimit: 1,
        },
        ...defaultFilters,
    },
    recommendations: {},
    supportedOverTimeComparisonTypes: [],
};

export const COMBO_CHART_UICONFIG: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            canAddItems: true,
            allowSelectChartType: true,
            allowOptionalStacking: true,
        },
        secondary_measures: {
            ...measuresBase,
            canAddItems: true,
            allowSelectChartType: true,
            allowShowOnSecondaryAxis: true,
        },
        view: {
            ...viewBase,
            canAddItems: true,
            itemsLimit: 1,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
    supportedOverTimeComparisonTypes: [
        OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        OverTimeComparisonTypes.PREVIOUS_PERIOD,
    ],
    supportedChartTypes: [VisualizationTypes.COLUMN, VisualizationTypes.LINE, VisualizationTypes.AREA],
    optionalStacking: {
        supported: true,
        disabled: false,
        stackMeasures: false,
    },
};

export const DEFAULT_XIRR_UICONFIG: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            accepts: [METRIC, FACT],
            itemsLimit: DEFAULT_XIRR_METRICS_COUNT,
            isShowInPercentVisible: false,
        },
        attribute: {
            ...viewBase,
            accepts: [DATE],
            itemsLimit: DEFAULT_XIRR_ATTRIBUTES_COUNT,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
    ...disabledExportConfig,
};

export const DEFAULT_BULLET_CHART_CONFIG: IUiConfig = {
    buckets: {
        [BucketNames.MEASURES]: {
            ...measuresBase,
            isShowOnSecondaryAxisVisible: false,
            isShowInPercentVisible: false,
            allowsReordering: false,
            canAddItems: true,
            itemsLimit: 1,
        },
        [BucketNames.SECONDARY_MEASURES]: {
            ...measuresBase,
            isShowOnSecondaryAxisVisible: false,
            isShowInPercentVisible: false,
            allowsReordering: false,
            canAddItems: true,
            itemsLimit: 1,
        },
        [BucketNames.TERTIARY_MEASURES]: {
            ...measuresBase,
            isShowOnSecondaryAxisVisible: false,
            isShowInPercentVisible: false,
            allowsReordering: false,
            canAddItems: true,
            itemsLimit: 1,
        },
        [BucketNames.VIEW]: {
            ...viewBase,
            allowsReordering: true,
            allowsSwapping: true,
            canAddItems: true,
            itemsLimit: 2,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
    supportedOverTimeComparisonTypes: [
        OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        OverTimeComparisonTypes.PREVIOUS_PERIOD,
    ],
};

export const BULLET_CHART_CONFIG_MULTIPLE_DATES: IUiConfig = {
    ...defaultRootUiConfigProperties,
    buckets: {
        [BucketNames.MEASURES]: {
            ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.MEASURES],
        },
        [BucketNames.SECONDARY_MEASURES]: {
            ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.SECONDARY_MEASURES],
        },
        [BucketNames.TERTIARY_MEASURES]: {
            ...DEFAULT_BULLET_CHART_CONFIG.buckets[BucketNames.TERTIARY_MEASURES],
        },
        [BucketNames.VIEW]: {
            ...viewBase,
            allowsReordering: true,
            allowsSwapping: true,
            canAddItems: true,
            itemsLimit: 2,
            itemsLimitByType: {
                date: 2,
            },
            allowsDuplicateDates: true,
            preferSynchronizedDates: true,
        },
        ...defaultFilters,
    },
    supportedOverTimeComparisonTypes: [
        OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        OverTimeComparisonTypes.PREVIOUS_PERIOD,
    ],
};

const geoMeasuresBase = {
    ...measuresBase,
    allowsReordering: false,
    itemsLimit: DEFAULT_PUSHPIN_METRICS_COUNT,
    isShowInPercentVisible: false,
    canAddItems: true,
};

const geoAttributesBase = {
    ...viewBase,
    accepts: [ATTRIBUTE],
    canAddItems: true,
    itemsLimit: DEFAULT_GEO_ATTRIBUTES_COUNT,
};

export const GEO_PUSHPIN_CHART_UICONFIG: IUiConfig = {
    buckets: {
        location: {
            ...geoAttributesBase,
            accepts: [ATTRIBUTE, GEO_ATTRIBUTE],
        },
        size: {
            ...geoMeasuresBase,
        },
        color: {
            ...geoMeasuresBase,
        },
        segment: {
            ...geoAttributesBase,
        },
        ...defaultFilters,
    },
    supportedLocationIcon: { supported: true },
    ...defaultRootUiConfigProperties,
    ...enabledNoMetricConfig,
};

export const DEFAULT_SANKEY_UI_CONFIG: IUiConfig = {
    buckets: {
        measures: {
            ...measuresBase,
            itemsLimit: 1,
            allowsReordering: false,
            canAddItems: true,
        },
        attribute_from: {
            ...viewBase,
            canAddItems: true,
        },
        attribute_to: {
            ...viewBase,
            canAddItems: true,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
};

export const DEFAULT_REPEATER_UI_CONFIG: IUiConfig = {
    buckets: {
        attribute: {
            ...viewBase,
            accepts: [ATTRIBUTE],
            itemsLimit: 1,
            canAddItems: true,
            allowsSwapping: true,
        },
        columns: {
            ...measuresBase,
            canAddItems: true,
            allowsReordering: true,
            allowsDuplicateItems: true,
            allowsDifferentAttributes: false,
            transformAttributeToMeasure: false,
        },
        ...defaultFilters,
    },
    ...defaultRootUiConfigProperties,
};

export function getTreemapUiConfig(
    allowsMultipleDates: boolean,
    hasNonStackAttributes: boolean,
    hasMultipleMeasures: boolean,
): IUiConfig {
    const measuresConfig = hasNonStackAttributes
        ? {
              itemsLimit: DEFAULT_TREEMAP_MEASURES_COUNT,
              allowsReordering: false,
              canAddItems: false,
              isShowInPercentEnabled: true,
          }
        : {};

    const viewsConfig =
        !hasNonStackAttributes && hasMultipleMeasures
            ? {
                  itemsLimit: 0,
              }
            : {};

    const multipleDatesConfig = allowsMultipleDates
        ? {
              itemsLimitByType: {
                  date: 1,
              },
              allowsDuplicateDates: true,
          }
        : {};
    const segmentBase = allowsMultipleDates ? stackBaseWithDate : stackBase;

    return {
        buckets: {
            measures: {
                ...measuresBase,
                ...measuresConfig,
            },
            view: {
                ...viewBase,
                ...viewsConfig,
                ...multipleDatesConfig,
            },
            segment: {
                ...segmentBase,
                ...multipleDatesConfig,
            },
            ...defaultFilters,
        },
        ...defaultRootUiConfigProperties,
    };
}
