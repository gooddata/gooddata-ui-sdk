// (C) 2022 GoodData Corporation
import { factoryNotationFor, isColorMappingItem } from "@gooddata/sdk-model";
import { IChartConfig } from "@gooddata/sdk-ui-charts";
import { chartConfigFromInsight } from "../../components/pluggableVisualizations/chartConfigFromInsight";
import { IInsightConversion, insightConversion } from "./insightToPropsConverter";
import { IAdditionalFactoryDefinition, PropMeta } from "./types";

// TODO move this file closer to PlugVis?

export const chartAdditionalFactories: IAdditionalFactoryDefinition[] = [
    {
        importInfo: {
            importType: "named",
            name: "getColorMappingPredicate",
            package: "@gooddata/sdk-ui-vis-commons",
        },
        transformation: (obj) => {
            return isColorMappingItem(obj)
                ? `{predicate: getColorMappingPredicate("${obj.id}"), color: ${factoryNotationFor(
                      obj.color,
                  )}}`
                : undefined;
        },
    },
];

export const chartConfigPropMeta: PropMeta = {
    propImport: {
        importType: "named",
        name: "IChartConfig",
        package: "@gooddata/sdk-ui-charts",
    },
    propType: "scalar",
};

export function chartConfigInsightConversion<TProps extends object, TPropKey extends keyof TProps>(
    propName: TPropKey,
): IInsightConversion<TProps, TPropKey, IChartConfig> {
    return insightConversion(propName, chartConfigPropMeta, chartConfigFromInsight);
}
