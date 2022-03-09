// (C) 2022 GoodData Corporation
import compact from "lodash/compact";
import isEmpty from "lodash/isEmpty";
import isFunction from "lodash/isFunction";
import isString from "lodash/isString";
import repeat from "lodash/repeat";
import toPairs from "lodash/toPairs";
import { factoryNotationFor, IInsightDefinition } from "@gooddata/sdk-model";
import { IEmbeddingCodeConfig } from "../interfaces/VisualizationDescriptor";

export interface IComponentInfo {
    name: string;
    importType: "default" | "named";
    package: string;
}

function toComponentImport(componentInfo: IComponentInfo): string {
    return componentInfo.importType === "default"
        ? `import ${componentInfo.name} from "${componentInfo.package}";`
        : `import { ${componentInfo.name} } from "${componentInfo.package}";`;
}

const allSdkModelFactories = [
    // ObjRef factories
    "uriRef",
    "idRef",
    "localIdRef",
    // attribute factories
    "newAttribute",
    // measure factories
    "newMeasure",
    "newArithmeticMeasure",
    "newPopMeasure",
    "newPreviousPeriodMeasure",
    // filter factories
    "newAbsoluteDateFilter",
    "newRelativeDateFilter",
    "newNegativeAttributeFilter",
    "newPositiveAttributeFilter",
    "newMeasureValueFilter",
    "newRankingFilter",
    // sort factories
    "newAttributeSort",
    "newAttributeAreaSort",
    "newMeasureSort",
    // total factories
    "newTotal",
];

function detectSdkModelImports(serializedProps: string): string[] {
    const detectedFactories = allSdkModelFactories.filter((factory) => serializedProps.includes(factory));
    detectedFactories.sort();
    return detectedFactories;
}

const TAB_SIZE = 4;

function indent(str: string, tabs: number): string {
    return str
        .split("\n")
        .map((chunk) => `${repeat(" ", tabs * TAB_SIZE)}${chunk}`)
        .join("\n");
}

function wrapWithDiv(code: string, height: number | string): string {
    const stringifiedHeight = isString(height) ? `"${height}"` : height.toString();
    return `<div style={{ height: ${stringifiedHeight} }}>\n${indent(code, 1)}\n</div>`;
}

export function getReactEmbeddingCodeGenerator(
    componentInfo: IComponentInfo,
    insightToProps: (insight: IInsightDefinition) => Record<string, any>,
): (insight: IInsightDefinition, config?: IEmbeddingCodeConfig) => string {
    return (insight, config) => {
        const props = insightToProps(insight);
        const serializedProps = toPairs(props)
            // we ignore functions as there is no bullet-proof way to serialize them
            .filter(([_, value]) => !isFunction(value))
            .filter(([_, value]) => !isEmpty(value))
            .map(([key, value]) =>
                isString(value) ? `${key}="${value}"` : `${key}={${factoryNotationFor(value)}}`,
            )
            .join("\n");

        const detectedFactories = detectSdkModelImports(serializedProps);
        const factoriesImport = detectedFactories.length
            ? `import { ${detectedFactories.join(", ")} } from "@gooddata/sdk-model";`
            : "";

        const imports = compact([
            'import React from "react";',
            factoriesImport,
            toComponentImport(componentInfo),
        ]);

        const componentBody = `<${componentInfo.name}\n${indent(serializedProps, 1)}\n/>`;
        const wrapped = config?.height ? wrapWithDiv(componentBody, config.height) : componentBody;

        return `${imports.join("\n")}

function MyComponent() {
    return (
${indent(wrapped, 2)}
    );
}
`;
    };
}
