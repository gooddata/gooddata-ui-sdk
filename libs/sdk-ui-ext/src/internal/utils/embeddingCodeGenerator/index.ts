// (C) 2022 GoodData Corporation
import compact from "lodash/compact";
import flow from "lodash/fp/flow";
import groupBy from "lodash/fp/groupBy";
import isEmpty from "lodash/isEmpty";
import isFunction from "lodash/isFunction";
import isString from "lodash/isString";
import join from "lodash/fp/join";
import map from "lodash/fp/map";
import partition from "lodash/fp/partition";
import repeat from "lodash/repeat";
import sortBy from "lodash/sortBy";
import toPairs from "lodash/fp/toPairs";
import { factoryNotationFor, IInsightDefinition } from "@gooddata/sdk-model";

import { IEmbeddingCodeConfig, IEmbeddingCodeContext } from "../../interfaces/VisualizationDescriptor";

import { normalizeInsight } from "./normalizeInsight";

interface IImportInfo {
    name: string;
    importType: "default" | "named";
    package: string;
}

const allSdkModelFactories: IImportInfo[] = [
    // ObjRef factories
    { name: "uriRef", package: "@gooddata/sdk-model", importType: "named" },
    { name: "idRef", package: "@gooddata/sdk-model", importType: "named" },
    { name: "localIdRef", package: "@gooddata/sdk-model", importType: "named" },
    // attribute factories
    { name: "newAttribute", package: "@gooddata/sdk-model", importType: "named" },
    // measure factories
    { name: "newMeasure", package: "@gooddata/sdk-model", importType: "named" },
    { name: "newArithmeticMeasure", package: "@gooddata/sdk-model", importType: "named" },
    { name: "newPopMeasure", package: "@gooddata/sdk-model", importType: "named" },
    { name: "newPreviousPeriodMeasure", package: "@gooddata/sdk-model", importType: "named" },
    // filter factories
    { name: "newAbsoluteDateFilter", package: "@gooddata/sdk-model", importType: "named" },
    { name: "newRelativeDateFilter", package: "@gooddata/sdk-model", importType: "named" },
    { name: "newNegativeAttributeFilter", package: "@gooddata/sdk-model", importType: "named" },
    { name: "newPositiveAttributeFilter", package: "@gooddata/sdk-model", importType: "named" },
    { name: "newMeasureValueFilter", package: "@gooddata/sdk-model", importType: "named" },
    { name: "newRankingFilter", package: "@gooddata/sdk-model", importType: "named" },
    // sort factories
    { name: "newAttributeSort", package: "@gooddata/sdk-model", importType: "named" },
    { name: "newAttributeAreaSort", package: "@gooddata/sdk-model", importType: "named" },
    { name: "newMeasureSort", package: "@gooddata/sdk-model", importType: "named" },
    // total factories
    { name: "newTotal", package: "@gooddata/sdk-model", importType: "named" },
];

function detectSdkModelImports(serializedProps: string): IImportInfo[] {
    return allSdkModelFactories.filter(({ name }) => serializedProps.includes(name));
}

const TAB_SIZE = 4;
const DEFAULT_HEIGHT = 400;

function indent(str: string, tabs: number): string {
    return str
        .split("\n")
        .map((chunk) => `${repeat(" ", tabs * TAB_SIZE)}${chunk}`)
        .join("\n");
}

const renderImports: (imports: IImportInfo[]) => string = flow(
    groupBy((i: IImportInfo) => i.package),
    toPairs,
    map(([pkg, imports]: [string, IImportInfo[]]) => {
        const [[defaultImport], namedImports] = partition((i) => i.importType === "default", imports);

        return compact([
            "import",
            defaultImport?.name,
            namedImports.length && `{ ${sortBy(namedImports.map((i) => i.name)).join(", ")} }`,
            "from",
            `"${pkg}";`,
        ]).join(" ");
    }),
    join("\n"),
);

export function getReactEmbeddingCodeGenerator(
    componentImport: IImportInfo,
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

        const imports: IImportInfo[] = compact([
            { name: "React", package: "react", importType: "default" },
            ...detectedFactories,
            componentImport,
        ]);

        const height = config?.height ?? DEFAULT_HEIGHT;
        const stringifiedHeight = isString(height) ? `"${height}"` : height.toString();

        const componentBody = `<${componentImport.name}\n${indent(serializedProps, 1)}\n/>`;

        return `${renderImports(imports)}

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
