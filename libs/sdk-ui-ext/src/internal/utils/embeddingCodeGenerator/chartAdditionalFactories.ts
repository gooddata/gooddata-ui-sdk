// (C) 2022 GoodData Corporation
import { factoryNotationFor, isColorMappingItem } from "@gooddata/sdk-model";
import { IAdditionalFactoryDefinition, PropMeta } from "./types";

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
