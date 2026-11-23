// (C) 2007-2026 GoodData Corporation

import {
    type CodeBlockWriter,
    type ImportDeclarationStructure,
    type OptionalKind,
    Project,
    type SourceFile,
    type WriterFunction,
} from "ts-morph";

import { type MeasureAggregation } from "@gooddata/sdk-model";

import {
    type Attribute,
    type DateDataSet,
    type DisplayForm,
    type Fact,
    type Metric,
    type WorkspaceMetadata,
} from "../base/types.js";

import { type TakenNamesSet, createUniqueVariableName, stringToVariableName } from "./titles.js";

export type TypescriptOutput = {
    project: Project;
    sourceFile: SourceFile;
};

/**
 * A value in the generated code: either code text, or an object literal with these properties.
 */
type GeneratedValue = string | GeneratedProperty[];

/**
 * A property of a generated object literal, or an exported constant at the top level of the file.
 */
type GeneratedProperty = {
    docs?: string[];
    name: string;
    value: GeneratedValue;
};

//
// Constants
//

const FILE_DIRECTIVES = ["/* eslint-disable */"];
const FILE_HEADER = `/* THIS FILE WAS AUTO-GENERATED USING CATALOG EXPORTER; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: ${new Date().toISOString()}; */`;
const INSIGHT_MAP_VARNAME = "Insights";
const ANALYTICAL_DASHBOARD_MAP_VARNAME = "Dashboards";
const DATE_DATASETS_MAP_VARNAME = "DateDatasets";
// "count" aggregation is not allowed for Facts, so do not generate code for that
const FACT_AGGREGATIONS: MeasureAggregation[] = ["sum", "avg", "min", "max", "median", "runsum"];

//
// Variable naming support & strategies
//

let GlobalNameScope: TakenNamesSet = {};

type NamingStrategy = (title: string, scope: TakenNamesSet) => string;

type NamingStrategies = {
    dataSetProperty: NamingStrategy;
    dataSetAttributeProperty: NamingStrategy;
    attribute: NamingStrategy;
    displayForm: NamingStrategy;
};

const DefaultNaming: NamingStrategies = {
    dataSetProperty: uniqueVariable,
    dataSetAttributeProperty: uniqueVariable,
    attribute: uniqueVariable,
    displayForm: uniqueVariable,
};

/**
 * This is a wrapper on top of createUniqueVariableName() which mutates the input name scope - it enters
 * the variable name into the scope.
 *
 * @param title - md object title
 * @param nameScope - scope containing already taken variable names, defaults to global scope
 */
function uniqueVariable(title: string, nameScope: TakenNamesSet = GlobalNameScope): string {
    const variableName = createUniqueVariableName(title, nameScope);
    nameScope[variableName] = true;

    return variableName;
}

//
// Writing the generated code
//

function writeDocs(writer: CodeBlockWriter, docs: string[]): void {
    const lines = docs.flatMap((doc) => doc.split(/\r?\n/));

    if (lines.length === 1) {
        writer.writeLine(`/** ${lines[0]} */`);
        return;
    }

    writer.writeLine("/**");
    lines.forEach((line) => writer.writeLine(` * ${line}`));
    writer.writeLine(" */");
}

function writeValue(writer: CodeBlockWriter, value: GeneratedValue): void {
    if (typeof value === "string") {
        writer.write(value);
    } else if (value.length === 0) {
        writer.write("{}");
    } else {
        // one property per line, indented by the writer
        writer.inlineBlock(() => {
            value.forEach(({ docs, name, value: propertyValue }) => {
                if (docs) {
                    writeDocs(writer, docs);
                }
                writer.write(`${name}: `);
                writeValue(writer, propertyValue);
                writer.write(",").newLine();
            });
        });
    }
}

/**
 * Writes the exported constants with a blank line before each of them. The constants are written as statements
 * rather than ts-morph variable structures: ts-morph writes an initializer with a hanging indent, which would
 * push every line of a multi-line object literal one level too deep.
 */
function writeConstants(constants: GeneratedProperty[]): WriterFunction {
    return (writer) => {
        constants.forEach(({ docs, name, value }) => {
            writer.blankLineIfLastNot();
            if (docs) {
                writeDocs(writer, docs);
            }
            writer.write(`export const ${name} = `);
            writeValue(writer, value);
            writer.write(";").newLine();
        });
    };
}

//
// Transformation to the generated code
//

function initialize(outputFile: string): TypescriptOutput {
    const project = new Project({});
    const sourceFile = project.createSourceFile(
        outputFile,
        {
            leadingTrivia: [...FILE_DIRECTIVES, FILE_HEADER],
        },
        { overwrite: true },
    );

    return {
        project,
        sourceFile,
    };
}

function generateSdkModelImports(projectMeta: WorkspaceMetadata): OptionalKind<ImportDeclarationStructure> {
    const hasAttributeConstants = projectMeta.catalog.attributes.length > 0;
    const hasDateDataSetAttributes = projectMeta.dateDataSets.some(
        (dateDataSet) => dateDataSet.dateDataSet.content.attributes.length > 0,
    );
    const hasMetrics = projectMeta.catalog.metrics.length > 0;
    const hasFacts = projectMeta.catalog.facts.length > 0;

    const namedImports: Array<string | { name: string; isTypeOnly: true }> = [];

    if (hasAttributeConstants || hasDateDataSetAttributes || hasMetrics || hasFacts) {
        namedImports.push("idRef");
    }

    if (hasAttributeConstants || hasDateDataSetAttributes) {
        namedImports.push("newAttribute");
    }

    if (hasMetrics || hasFacts) {
        namedImports.push("newMeasure");
    }

    return {
        moduleSpecifier: "@gooddata/sdk-model",
        namedImports,
    };
}

function generateAttributeDisplayForm(
    displayForm: DisplayForm,
    attributeVariableName: string,
    nameScope: TakenNamesSet,
    naming: NamingStrategies,
): GeneratedProperty {
    const { meta } = displayForm;
    const dfVariableName = naming.displayForm(meta.title, nameScope);
    let variableName = attributeVariableName === dfVariableName ? "Default" : dfVariableName;

    if (variableName.startsWith(attributeVariableName)) {
        // we need to do the variable conversion again as it can happen that after removing the attribute name what is left starts with a number
        // for example Foo attribute and Foo123Bar display form becomes 123Bar which is invalid in this context
        variableName = stringToVariableName(variableName.substr(attributeVariableName.length));
    }

    return {
        docs: [`Display Form Title: ${meta.title}`, `Display Form ID: ${meta.identifier}`],
        name: variableName,
        value: `newAttribute('${meta.identifier}')`,
    };
}

/**
 * Generates display form property initializers for an attribute. When naming the display form properties, the naming strategy will
 * be used; the name returned from the strategy will be further tweaked to improve readability of the generated mapping:
 *
 * - if it equals to name of attribute, the display form key will be 'Default' (indicating default display form, preventing
 *   weird mapping of say Product.Product)
 *
 * - if the label is prefixed with attribute name, the prefix will be trimmed (going from say Product.ProductName to Product.Name)
 *
 * @param attribute - attribute to work with
 * @param attributeVariableName - variable name assigned to the attribute
 * @param naming - naming strategy to use
 */
function generateDisplayFormPropertyInitializers(
    attribute: Attribute,
    attributeVariableName: string,
    naming: NamingStrategies = DefaultNaming,
): GeneratedProperty[] {
    const localNameScope: TakenNamesSet = {};
    return attribute.attribute.content.displayForms.map((df) =>
        generateAttributeDisplayForm(df, attributeVariableName, localNameScope, naming),
    );
}

/**
 * Generates attribute constant. Works as follows:
 *
 * - If the attribute has single display form, generates a constant of DfTitle ⇒ newAttribute(id)
 * - If the attribute has multiple display forms, generates a constant that is an object mapping different
 *   DfTitles ⇒ newAttribute(dfId)
 *
 * **NOTE**: this function has side effect. as it generates the statement (which it returns) it will update the
 * attribute instance with name of the generated constant.
 *
 * @param attribute - attribute to generate definitions for
 * @param naming - naming scope to ensure variable name uniqueness
 * @param deprecation - if specified, add `@deprecated` doc with this message
 */
function generateAttributeConstant(
    attribute: Attribute,
    naming: NamingStrategies = DefaultNaming,
): GeneratedProperty {
    const { meta } = attribute.attribute;
    const variableName = naming.attribute(meta.title, GlobalNameScope);
    const { displayForms } = attribute.attribute.content;
    const docs = [`Attribute Title: ${meta.title}`, `Attribute ID: ${meta.identifier}`];

    if (displayForms.length === 1) {
        /*
         * If there is a single DF for the attribute, then have const AttrName = newAttribute(...)
         */
        const displayForm = displayForms[0];

        return {
            docs,
            name: variableName,
            value: `newAttribute('${displayForm.meta.identifier}')`,
        };
    } else {
        /*
         * If there are multiple DFs, have mapping of const AttrName = { DfName: newAttribute(), OtherDfName: newAttribute()}
         */
        return {
            docs,
            name: variableName,
            value: generateDisplayFormPropertyInitializers(attribute, variableName, naming),
        };
    }
}

function generateAttributes(projectMeta: WorkspaceMetadata): GeneratedProperty[] {
    return projectMeta.catalog.attributes.map((a) => generateAttributeConstant(a));
}

function generateMeasureFromMetric(metric: Metric): GeneratedProperty {
    const { meta } = metric.metric;
    const variableName = uniqueVariable(meta.title);

    return {
        docs: [`Metric Title: ${meta.title}`, `Metric ID: ${meta.identifier}`, "Metric Type: MAQL Metric"],
        name: variableName,
        value: `newMeasure(idRef('${meta.identifier}', "measure"))`,
    };
}

function generateFactAggregations(fact: Fact): GeneratedProperty[] {
    const { meta } = fact.fact;

    return FACT_AGGREGATIONS.map((aggregation) => ({
        docs: [
            `Fact Title: ${meta.title}`,
            `Fact ID: ${meta.identifier}`,
            `Fact Aggregation: ${aggregation}`,
        ],
        name: aggregation.charAt(0).toUpperCase() + aggregation.substr(1),
        value: `newMeasure(idRef('${meta.identifier}', "fact"), m => m.aggregation('${aggregation}'))`,
    }));
}

function generateMeasuresFromFacts(fact: Fact): GeneratedProperty {
    const { meta } = fact.fact;
    const variableName = uniqueVariable(meta.title);

    return {
        docs: [`Fact Title: ${meta.title}`, `Fact ID: ${meta.identifier}`],
        name: variableName,
        value: generateFactAggregations(fact),
    };
}

/**
 * Generates simple measures from metrics and facts defined in the project.
 *
 * - For metrics (MAQL stuff) this will generate constant with MeasureTitle = newMeasure(id)
 * - For facts, this will generate constant initialized to an object which defines all possible
 *   aggregations of the measure.
 */
function generateMeasures(projectMeta: WorkspaceMetadata): GeneratedProperty[] {
    const fromMetrics = projectMeta.catalog.metrics.map(generateMeasureFromMetric);
    const fromFacts = projectMeta.catalog.facts.map(generateMeasuresFromFacts);

    return fromMetrics.concat(fromFacts);
}

function generateDateDataSetAttributes(dd: DateDataSet, naming: NamingStrategies): GeneratedProperty[] {
    const ddScope = {};

    return dd.dateDataSet.content.attributes.map((a) => {
        const { meta } = a.attribute;
        const { title, identifier } = meta;

        const attributePropertyName = naming.dataSetAttributeProperty(meta.title, ddScope);
        const displayFormProps = generateDisplayFormPropertyInitializers(a, attributePropertyName, naming);

        return {
            docs: [`Date Attribute: ${title}`, `Date Attribute ID: ${identifier}`],
            name: attributePropertyName,
            value: [
                { name: "ref", value: `idRef('${identifier}', 'attribute')` },
                { name: "identifier", value: `'${identifier}'` },
                ...displayFormProps,
            ],
        };
    });
}

function generateDateDataSetInitialzier(
    dd: DateDataSet,
    naming: NamingStrategies,
    namingScope: TakenNamesSet,
): GeneratedProperty {
    const { title, identifier } = dd.dateDataSet.meta;

    return {
        docs: [`Date Data Set Title: ${title}`, `Date Data Set ID: ${identifier}`],
        name: naming.dataSetProperty(title, namingScope),
        value: [
            { name: "ref", value: `idRef('${identifier}', 'dataSet')` },
            { name: "identifier", value: `'${identifier}'` },
            ...generateDateDataSetAttributes(dd, naming),
        ],
    };
}

/**
 * Given date datasets, this generates a DateDataSets constants which is an object with a property per-dataset. For each
 * data set, there is another object with: `ref` property which contains data set's idRef and then property per-attribute.
 *
 * These per-attribute properties reference existing constants generated for the date attributes ⇒ this function MUST
 * be called after generateAttributes.
 *
 * @param dds - date data sets
 * @param naming - naming strategy
 */
function generateDateDataSetMapping(dds: DateDataSet[], naming: NamingStrategies): GeneratedProperty {
    const mappingScope = {};

    return {
        docs: ["Available Date Data Sets"],
        name: DATE_DATASETS_MAP_VARNAME,
        value: dds.map((dd) => generateDateDataSetInitialzier(dd, naming, mappingScope)),
    };
}

function generateDateDataSets(projectMeta: WorkspaceMetadata): GeneratedProperty[] {
    return [generateDateDataSetMapping(projectMeta.dateDataSets, DefaultNaming)];
}

/**
 * Declares a constant initialized to object mapping InsightTitle ⇒ insight identifier.
 *
 * @param projectMeta - project metadata containing the insights
 */
function generateInsights(projectMeta: WorkspaceMetadata): GeneratedProperty {
    return {
        name: INSIGHT_MAP_VARNAME,
        value: projectMeta.insights.map((insight) => ({
            docs: [`Insight Title: ${insight.title}`, `Insight ID: ${insight.identifier}`],
            name: uniqueVariable(insight.title),
            value: `'${insight.identifier}'`,
        })),
    };
}

/**
 * Declares a constant initialized to object mapping analyticalDashboard ⇒ analyticalDashboard identifier.
 *
 * @param projectMeta - project metadata containing the analyticalDashboards
 */
function generateAnalyticalDashboards(projectMeta: WorkspaceMetadata): GeneratedProperty {
    return {
        name: ANALYTICAL_DASHBOARD_MAP_VARNAME,
        value: projectMeta.analyticalDashboards.map((dashboard) => ({
            docs: [`Dashboard Title: ${dashboard.title}`, `Dashboard ID: ${dashboard.identifier}`],
            name: uniqueVariable(dashboard.title),
            value: `'${dashboard.identifier}'`,
        })),
    };
}

/**
 * Transforms project metadata into model definitions in TypeScript. The resulting TS source file will contain
 * constant declarations for the various objects in the metadata:
 *
 * - Attributes with single display form are transformed to constants initialized with respective newAttribute()
 * - Attributes with multiple display forms are transformed to constants initialized to map of df name ⇒ newAttribute()
 * - Metrics (MAQL) will be transformed to constants initialized with respective newMeasure()
 * - Metrics from facts will be transformed to constants initialized to map of aggregation ⇒ newMeasure()
 * - Date data set attributes will be transformed using the same logic as normal attributes, albeit with slightly
 *   modified variable naming strategy
 *
 * @param projectMeta - project metadata to transform to typescript
 * @param outputFile - output typescript file
 * @returns return of the transformation process, new file is not saved at this point
 */
export function transformToTypescript(projectMeta: WorkspaceMetadata, outputFile: string): TypescriptOutput {
    GlobalNameScope = {};

    const output = initialize(outputFile);
    const { sourceFile } = output;

    sourceFile.addImportDeclaration(generateSdkModelImports(projectMeta));
    sourceFile.addStatements(
        writeConstants([
            ...generateAttributes(projectMeta),
            ...generateMeasures(projectMeta),
            ...generateDateDataSets(projectMeta),
            generateInsights(projectMeta),
            generateAnalyticalDashboards(projectMeta),
        ]),
    );

    return output;
}
