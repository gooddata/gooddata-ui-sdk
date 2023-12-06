// (C) 2020-2023 GoodData Corporation

import { FeatureFlagsValues, ITigerFeatureFlags, TigerFeaturesNames } from "../uiFeatures.js";
import { convertState } from "./state.js";

export type FeatureDef = {
    id: string;
    key: string;
    l: boolean;
    version: string;
    type: "BOOLEAN" | "STRING" | "NUMBER" | "JSON";
    value: any;
};

export type FeaturesMap = Record<string, FeatureDef>;

export function mapFeatures(features: FeaturesMap): Partial<ITigerFeatureFlags> {
    return {
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableKPIDashboardExportPDF,
            "enableKPIDashboardExportPDF",
            "BOOLEAN",
            FeatureFlagsValues.enableKPIDashboardExportPDF,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableSortingByTotalGroup,
            "enableSortingByTotalGroup",
            "BOOLEAN",
            FeatureFlagsValues.enableSortingByTotalGroup,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.ADMeasureValueFilterNullAsZeroOption,
            "ADMeasureValueFilterNullAsZeroOption",
            "STRING",
            FeatureFlagsValues.ADMeasureValueFilterNullAsZeroOption,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableMultipleDates,
            "enableMultipleDates",
            "BOOLEAN",
            FeatureFlagsValues.enableMultipleDates,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableKPIDashboardDeleteFilterButton,
            "enableKPIDashboardDeleteFilterButton",
            "BOOLEAN",
            FeatureFlagsValues.enableKPIDashboardDeleteFilterButton,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.DashboardEditModeDevRollout,
            "dashboardEditModeDevRollout",
            "BOOLEAN",
            FeatureFlagsValues.dashboardEditModeDevRollout,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableMetricSqlAndDataExplain,
            "enableMetricSqlAndDataExplain",
            "BOOLEAN",
            FeatureFlagsValues.enableMetricSqlAndDataExplain,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableLongitudeAndLatitudeLabels,
            "enableLongitudeAndLatitudeLabels",
            "BOOLEAN",
            FeatureFlagsValues.enableLongitudeAndLatitudeLabels,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableDescriptions,
            "enableDescriptions",
            "BOOLEAN",
            FeatureFlagsValues.enableDescriptions,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableAnalyticalDashboardPermissions,
            "enableAnalyticalDashboardPermissions",
            "BOOLEAN",
            FeatureFlagsValues.enableAnalyticalDashboardPermissions,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableFunnelChart,
            "enableFunnelChart",
            "BOOLEAN",
            FeatureFlagsValues.enableFunnelChart,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnablePyramidChart,
            "enablePyramidChart",
            "BOOLEAN",
            FeatureFlagsValues.enablePyramidChart,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableSankeyChart,
            "enableSankeyChart",
            "BOOLEAN",
            FeatureFlagsValues.enableSankeyChart,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableDependencyWheelChart,
            "enableDependencyWheelChart",
            "BOOLEAN",
            FeatureFlagsValues.enableDependencyWheelChart,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableWaterfallChart,
            "enableWaterfallChart",
            "BOOLEAN",
            FeatureFlagsValues.enableWaterfallChart,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableSqlDatasets,
            "enableSqlDatasets",
            "BOOLEAN",
            FeatureFlagsValues.enableSqlDatasets,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableCompositeGrain,
            "enableCompositeGrain",
            "BOOLEAN",
            FeatureFlagsValues.enableCompositeGrain,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableTableTotalRows,
            "enableTableTotalRows",
            "BOOLEAN",
            FeatureFlagsValues.enableTableTotalRows,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnablePdmRemovalDeprecationPhase,
            "enablePdmRemovalDeprecationPhase",
            "BOOLEAN",
            FeatureFlagsValues.enablePdmRemovalDeprecationPhase,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableNewHeadline,
            "enableNewHeadline",
            "BOOLEAN",
            FeatureFlagsValues.enableNewHeadline,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableAttributeHierarchies,
            "enableAttributeHierarchies",
            "BOOLEAN",
            FeatureFlagsValues.enableAttributeHierarchies,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableUnavailableItemsVisible,
            "enableUnavailableItemsVisible",
            "BOOLEAN",
            FeatureFlagsValues.enableUnavailableItemsVisible,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnablePivotTableIncreaseBucketSize,
            "enablePivotTableIncreaseBucketSize",
            "BOOLEAN",
            FeatureFlagsValues.enablePivotTableIncreaseBucketSize,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableUserManagement,
            "enableUserManagement",
            "BOOLEAN",
            FeatureFlagsValues.enableUserManagement,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableKDDependentFilters,
            "enableKDDependentFilters",
            "BOOLEAN",
            FeatureFlagsValues.enableKDDependentFilters,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableKDSavedFilters,
            "enableKDSavedFilters",
            "BOOLEAN",
            FeatureFlagsValues.enableKDSavedFilters,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableClickHouseDataSource,
            "enableClickHouseDataSource",
            "BOOLEAN",
            FeatureFlagsValues.enableClickHouseDataSource,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableCsvAnalytics,
            "enableCsvAnalytics",
            "BOOLEAN",
            FeatureFlagsValues.enableCsvAnalytics,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableKDCrossFiltering,
            "enableKDCrossFiltering",
            "BOOLEAN",
            FeatureFlagsValues.enableKDCrossFiltering,
        ),
    };
}

function loadFeature(
    features: FeaturesMap,
    feature: TigerFeaturesNames,
    name: keyof ITigerFeatureFlags,
    outputType: "STRING" | "BOOLEAN",
    possibleValues: readonly any[],
) {
    const item = features[feature];

    if (!item) {
        return {};
    }

    const val = getValueByType(item.type, item.value, outputType, possibleValues);
    return val !== undefined ? { [name]: val } : {};
}

function getValueByType(
    inputType: FeatureDef["type"],
    value: FeatureDef["value"],
    outputType: "STRING" | "BOOLEAN",
    possibleValues: readonly any[],
) {
    switch (inputType) {
        case "BOOLEAN":
            if (value !== undefined) {
                return value;
            }
            break;
        case "STRING": {
            const state = convertState(outputType, possibleValues, value);
            if (state !== undefined) {
                return state;
            }
            break;
        }
        default:
            break;
    }
    return undefined;
}
