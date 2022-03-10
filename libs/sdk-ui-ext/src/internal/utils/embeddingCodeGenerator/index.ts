// (C) 2022 GoodData Corporation
import compact from "lodash/compact";
import isEmpty from "lodash/isEmpty";
import isFunction from "lodash/isFunction";
import isString from "lodash/isString";
import repeat from "lodash/repeat";
import toPairs from "lodash/fp/toPairs";
import { factoryNotationFor, IInsightDefinition } from "@gooddata/sdk-model";

import { IEmbeddingCodeConfig, IEmbeddingCodeContext } from "../../interfaces/VisualizationDescriptor";

import { normalizeInsight } from "./normalizeInsight";

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
const DEFAULT_HEIGHT = 400;

function indent(str: string, tabs: number): string {
    return str
        .split("\n")
        .map((chunk) => `${repeat(" ", tabs * TAB_SIZE)}${chunk}`)
        .join("\n");
}

export function getReactEmbeddingCodeGenerator(
    componentInfo: IComponentInfo,
    insightToProps: (insight: IInsightDefinition, ctx?: IEmbeddingCodeContext) => Record<string, any>,
): (insight: IInsightDefinition, config?: IEmbeddingCodeConfig) => string {
    return (insight, config) => {
        const normalizedInsight = normalizeInsight(insight);
        const props = insightToProps(normalizedInsight, config?.context);
        const propPairs = toPairs(props)
            // we ignore functions as there is no bullet-proof way to serialize them
            .filter(([_, value]) => !isFunction(value))
            .filter(([_, value]) => !isEmpty(value));

        const propDeclarations = propPairs
            .map(([key, value]) =>
                isString(value)
                    ? `const ${key} = "${value}";`
                    : `const ${key} = ${factoryNotationFor(value)};`,
            )
            .join("\n");

        const serializedProps = propPairs.map(([key]) => `${key}={${key}}`).join("\n");

        const detectedFactories = detectSdkModelImports(propDeclarations);
        const factoriesImport = detectedFactories.length
            ? `import { ${detectedFactories.join(", ")} } from "@gooddata/sdk-model";`
            : "";

        const imports = compact([
            'import React from "react";',
            factoriesImport,
            toComponentImport(componentInfo),
        ]);

        const height = config?.height ?? DEFAULT_HEIGHT;
        const stringifiedHeight = isString(height) ? `"${height}"` : height.toString();

        const componentBody = `<${componentInfo.name}\n${indent(serializedProps, 1)}\n/>`;

        return `${imports.join("\n")}

${propDeclarations}
const style = { height: ${stringifiedHeight} };

function MyComponent() {
    return (
        <div style={style}>
${indent(componentBody, 3)}
        </div>
    );
}
`;
    };
}
