// (C) 2022 GoodData Corporation
import { factoryNotationFor, isColorMappingItem } from "@gooddata/sdk-model";
import { IAdditionalFactoryDefinition } from "./types";

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
