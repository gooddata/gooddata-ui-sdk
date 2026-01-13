// (C) 2022-2025 GoodData Corporation

import { compact, groupBy, isEmpty, partition, sortBy, uniqBy } from "lodash-es";

import { type IInsightDefinition, factoryNotationFor } from "@gooddata/sdk-model";

import { normalizeInsight } from "./normalizeInsight.js";
import {
    type IAdditionalFactoryDefinition,
    type IEmbeddingCodeGeneratorSpecification,
    type IImportInfo,
    type PropWithMeta,
    type PropsWithMeta,
} from "./types.js";
import { type IEmbeddingCodeConfig } from "../../interfaces/VisualizationDescriptor.js";

// these are in line with what `factoryNotationFor` supports
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
    "newMeasureValueFilterWithOptions",
    "newRankingFilter",
    // sort factories
    "newAttributeSort",
    "newAttributeAreaSort",
    "newMeasureSort",
    // total factories
    "newTotal",
].map((name): IImportInfo => ({ name, importType: "named", package: "@gooddata/sdk-model" }));

function detectFactoryImports(
    propDeclarations: string[],
    additionalFactories: IAdditionalFactoryDefinition[],
): IImportInfo[] {
    const serializedProps = propDeclarations.join("\n");
    return [...defaultFactories, ...additionalFactories.map((f) => f.importInfo)].filter(({ name }) => {
        // Use word boundary regex to avoid matching substrings
        // e.g., "newMeasureValueFilterWithOptions" should not match "newMeasureValueFilter"
        const pattern = new RegExp(`\\b${name}\\b`);
        return pattern.test(serializedProps);
    });
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
        .map((chunk) => `${" ".repeat(tabs * TAB_SIZE)}${chunk}`)
        .join("\n");
}

const renderImports = (imports: IImportInfo[]) =>
    Object.entries(groupBy(imports, (i: IImportInfo) => i.package))
        .map(([pkg, imports]: [string, IImportInfo[]]) => {
            const [[defaultImport], namedImports] = partition(imports, (i) => i.importType === "default");

            return compact([
                "import",
                compact([
                    defaultImport?.name,
                    namedImports.length &&
                        `{ ${sortBy(
                            namedImports.map((i) => i.name),
                            (i) => i.toLowerCase(), // sort by lower case, otherwise "Z" would be before "a"
                        ).join(", ")} }`,
                ]).join(", "),
                "from",
                `"${pkg}";`,
            ]).join(" ");
        })
        .join("\n");

const REACT_IMPORT_INFO: IImportInfo = { name: "React", package: "react", importType: "default" };

function walkProps<TProps>(
    props: PropsWithMeta<TProps>,
    additionalFactories?: IAdditionalFactoryDefinition[],
    config?: IEmbeddingCodeConfig,
): {
    importsUsed: IImportInfo[];
    propDeclarations: string[];
    propUsages: string[];
} {
    const language = config?.language ?? "ts";
    const propsToOmit = config?.omitChartProps ?? [];
    const importsUsed: IImportInfo[] = [];

    // we ignore undefined values and functions as there is no bullet-proof way to serialize them
    // Note: isEmpty() returns true for primitive values like numbers/booleans, so we check for them explicitly
    // Non-empty strings are handled correctly by isEmpty(), but we explicitly check to be safe
    const propPairsIgnoredFunctions = Object.entries<PropWithMeta<any>>(props).filter(
        ([_, meta]) =>
            meta !== undefined &&
            !(typeof meta.value === "function") &&
            (typeof meta.value === "number" || typeof meta.value === "boolean" || !isEmpty(meta.value)),
    );

    //omit chart configuration when define in config
    const propPairs = propPairsIgnoredFunctions.filter(([key, _]) => !propsToOmit.includes(key));

    // get variable declaration for each prop to render outside of the component
    const propDeclarations = propPairs.map(([key, { value, meta }]) => {
        if (typeof value === "string") {
            return `const ${key} = "${value}";`;
        }

        // Primitives (numbers, booleans) don't need type annotations or factory notation
        if (typeof value === "number" || typeof value === "boolean") {
            return `const ${key} = ${value};`;
        }

        const rhsValue = extendedFactoryNotationFor(value, additionalFactories ?? []);

        if (language === "ts" && meta.typeImport) {
            const typeDeclaration =
                meta.cardinality === "array" ? `${meta.typeImport.name}[]` : meta.typeImport.name;
            importsUsed.push(meta.typeImport);
            return `const ${key}: ${typeDeclaration} = ${rhsValue};`;
        } else {
            return `const ${key} = ${rhsValue};`;
        }
    });

    // get the prop={prop} pairs to fill the component with
    const propUsages = propPairs.map(([key]) => `${key}={${key}}`);

    // add all the factories used in the propDeclarations so that we can add their imports later
    const detectedFactories = detectFactoryImports(propDeclarations, additionalFactories ?? []);
    importsUsed.push(...detectedFactories);

    return {
        importsUsed: uniqBy(importsUsed, (i) => `${i.package}#${i.name}`),
        propDeclarations,
        propUsages,
    };
}

/**
 * Creates a React embedding code generator.
 *
 * @remarks
 * This abstracts away much of the particular-pluggable-visualization-type-agnostic logic,
 * taking the visualization-type-specific information in the `specification` parameter.
 *
 * @param specification - specification of the code generator
 * @returns function that can be used to obtain React embedding code
 */
export function getReactEmbeddingCodeGenerator<TProps extends object>({
    component,
    insightToProps,
    additionalFactories,
}: IEmbeddingCodeGeneratorSpecification<TProps>): (
    insight: IInsightDefinition,
    config?: IEmbeddingCodeConfig,
) => string {
    return (insight, config) => {
        const normalizedInsight = normalizeInsight(insight);

        const props = insightToProps(normalizedInsight, config?.context);
        const { importsUsed, propDeclarations, propUsages } = walkProps(props, additionalFactories, config);

        const imports = compact([REACT_IMPORT_INFO, ...importsUsed, component]);

        const height = config?.height ?? DEFAULT_HEIGHT;
        const stringifiedHeight = typeof height === "string" ? `"${height}"` : height.toString();

        const componentBody = `<${component.name}\n${indent(propUsages.join("\n"), 1)}\n/>`;

        return `${renderImports(imports)}

${propDeclarations.join("\n")}
const style = {height: ${stringifiedHeight}};

export function MyComponent() {
    return (
        <div style={style}>
${indent(componentBody, 3)}
        </div>
    );
}
`;
    };
}
