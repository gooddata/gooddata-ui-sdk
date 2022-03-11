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

const defaultFactories: IImportInfo[] = [
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
].map((name): IImportInfo => ({ name, importType: "named", package: "@gooddata/sdk-model" }));

function detectFactoryImports(
    serializedProps: string,
    additionalFactories: IAdditionalFactoryDefinition[],
): IImportInfo[] {
    return [...defaultFactories, ...additionalFactories.map((f) => f.importInfo)].filter(({ name }) =>
        serializedProps.includes(name),
    );
}

function extendedFactoryNotationFor(value: any, additionalFactories: IAdditionalFactoryDefinition[]): string {
    return factoryNotationFor(value, (obj) => {
        let additionalMatch;
        for (const f of additionalFactories) {
            additionalMatch = f.transformation(obj);
            if (additionalMatch) {
                break;
            }
        }

        return additionalMatch;
    });
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
            namedImports.length &&
                `{ ${sortBy(
                    namedImports.map((i) => i.name),
                    (i) => i.toLowerCase(), // sort by lower case, otherwise "Z" would be before "a"
                ).join(", ")} }`,
            "from",
            `"${pkg}";`,
        ]).join(" ");
    }),
    join("\n"),
);

const REACT_IMPORT_INFO: IImportInfo = { name: "React", package: "react", importType: "default" };

interface IAdditionalFactoryDefinition {
    importInfo: IImportInfo;
    transformation: (obj: any) => string | undefined;
}

interface IEmbeddingCodeGeneratorInput {
    component: IImportInfo;
    insightToProps: (insight: IInsightDefinition, ctx?: IEmbeddingCodeContext) => Record<string, any>;
    additionalFactories?: IAdditionalFactoryDefinition[];
}

export function getReactEmbeddingCodeGenerator({
    component,
    insightToProps,
    additionalFactories,
}: IEmbeddingCodeGeneratorInput): (insight: IInsightDefinition, config?: IEmbeddingCodeConfig) => string {
    return (insight, config) => {
        const normalizedInsight = normalizeInsight(insight);

        const props = insightToProps(normalizedInsight, config?.context);
        // we ignore functions as there is no bullet-proof way to serialize them
        const propPairs = toPairs(props).filter(([_, value]) => !isFunction(value) && !isEmpty(value));

        const propDeclarations = propPairs
            .map(([key, value]) =>
                isString(value)
                    ? `const ${key} = "${value}";`
                    : `const ${key} = ${extendedFactoryNotationFor(value, additionalFactories ?? [])};`,
            )
            .join("\n");

        const propUsages = propPairs.map(([key]) => `${key}={${key}}`).join("\n");

        const detectedFactories = detectFactoryImports(propDeclarations, additionalFactories ?? []);
        const imports = compact([REACT_IMPORT_INFO, ...detectedFactories, component]);

        const height = config?.height ?? DEFAULT_HEIGHT;
        const stringifiedHeight = isString(height) ? `"${height}"` : height.toString();

        const componentBody = `<${component.name}\n${indent(propUsages, 1)}\n/>`;

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
