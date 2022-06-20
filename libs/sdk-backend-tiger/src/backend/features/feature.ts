// (C) 2020-2022 GoodData Corporation

import { FeatureContext } from "@gooddata/api-client-tiger";
import { ITigerFeatureFlags, TigerFeaturesNames, FeatureFlagsValues } from "../uiFeatures";
import { convertState } from "./state";

export type FeatureDef = {
    id: string;
    key: string;
    l: boolean;
    version: string;
    type: "BOOLEAN" | "STRING" | "NUMBER" | "JSON";
    value: any;
    strategies: Array<StrategiesDef>;
};

export type StrategiesDef = {
    id: string;
    value: FeatureDef["value"];
    attributes: Array<AttributeDef>;
};

export type AttributeDef = {
    conditional:
        | "EQUALS"
        | "ENDS_WITH"
        | "STARTS_WITH"
        | "GREATER"
        | "GREATER_EQUALS"
        | "LESS"
        | "LESS_EQUALS"
        | "NOT_EQUALS"
        | "INCLUDES"
        | "EXCLUDES"
        | "REGEX";
    fieldName: string;
    value?: string;
    values?: string[];
    type: "STRING" | "SEMANTIC_VERSION" | "NUMBER" | "DATE" | "DATETIME" | "BOOLEAN" | "IP_ADDRESS";
    array?: boolean;
};

export type FeaturesMap = Record<string, FeatureDef>;

export function mapFeatures(features: FeaturesMap, context: FeatureContext): Partial<ITigerFeatureFlags> {
    return {
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableSortingByTotalGroup,
            "enableSortingByTotalGroup",
            "BOOLEAN",
            FeatureFlagsValues.enableSortingByTotalGroup,
            context,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.ADmeasureValueFilterNullAsZeroOption,
            "ADmeasureValueFilterNullAsZeroOption",
            "STRING",
            FeatureFlagsValues.ADmeasureValueFilterNullAsZeroOption,
            context,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableMultipleDates,
            "enableMultipleDates",
            "BOOLEAN",
            FeatureFlagsValues.enableMultipleDates,
            context,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.EnableKPIDashboardDeleteFilterButton,
            "enableKPIDashboardDeleteFilterButton",
            "BOOLEAN",
            FeatureFlagsValues.enableKPIDashboardDeleteFilterButton,
            context,
        ),
        ...loadFeature(
            features,
            TigerFeaturesNames.DashboardEditModeDevRollout,
            "dashboardEditModeDevRollout",
            "BOOLEAN",
            FeatureFlagsValues.dashboardEditModeDevRollout,
            context,
        ),
    };
}

function loadFeature(
    features: FeaturesMap,
    feature: TigerFeaturesNames,
    name: keyof ITigerFeatureFlags,
    outputType: "STRING" | "BOOLEAN",
    possibleValues: readonly any[],
    context: FeatureContext,
) {
    const item = features[feature];

    if (!item) {
        return {};
    }

    let val = getValueByContext(item, context);
    val = getValueByType(item.type, val, outputType, possibleValues);

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

function getValueByContext(def: FeatureDef, context: FeatureContext) {
    const { strategies, value } = def;

    if (strategies && strategies.length > 0) {
        return getEarlyAccessValue(value, strategies, context.earlyAccess);
    }
    return value;
}

function getEarlyAccessValue<T>(
    defaultValue: T,
    strategies: StrategiesDef[],
    earlyAccessValue: string = "",
): T {
    const earlyAccessStrategies = strategies.filter((item) => item.attributes.find(findEarlyAccess));

    if (earlyAccessStrategies.length > 0) {
        for (let s = 0; s < earlyAccessStrategies.length; s++) {
            const earlyAccessStrategy = earlyAccessStrategies[s];
            const earlyAccesses = earlyAccessStrategy
                ? earlyAccessStrategy.attributes.filter(findEarlyAccess)
                : [];

            for (let i = 0; i < earlyAccesses.length; i++) {
                const earlyAccess = earlyAccesses[i];
                const values = (earlyAccess.values || [earlyAccess.value]).filter(Boolean) as Array<string>;
                if (earlyAccess.conditional === "EQUALS" && values.includes(earlyAccessValue)) {
                    return earlyAccessStrategy.value;
                }
                if (earlyAccess.conditional === "NOT_EQUALS" && !values.includes(earlyAccessValue)) {
                    return earlyAccessStrategy.value;
                }
            }
        }
    }
    return defaultValue;
}

function findEarlyAccess(attr: AttributeDef) {
    return attr.fieldName === "earlyAccess" && attr.type === "STRING";
}
