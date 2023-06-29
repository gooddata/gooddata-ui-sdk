// (C) 2007-2022 GoodData Corporation
import {
    ImportDeclarationStructure,
    OptionalKind,
    Project,
    SourceFile,
    VariableDeclarationKind,
    VariableStatementStructure,
} from "ts-morph";
import { MeasureAggregation } from "@gooddata/sdk-model";
import { Attribute, DateDataSet, DisplayForm, Fact, Metric, WorkspaceMetadata } from "../base/types.js";
import { createUniqueVariableName, stringToVariableName, TakenNamesSet } from "./titles.js";

export type TypescriptOutput = {
    project: Project;
    sourceFile: SourceFile;
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

const DateDataSetNaming: NamingStrategies = {
    dataSetProperty: dateDataSetProperty,
    dataSetAttributeProperty: dateDataSetAttributeProperty,
    attribute: dateAttributeSwitcharoo,
    displayForm: dateDisplayFormStrip,
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

/**
 * This is a wrapper on top of uniqueVariable. It is useful when naming date data set properties within the DateDatasets mapping.
 *
 * Date data sets have a convention where date data set title is "Date (data set name)". As the context of date data sets
 * is already established, no one cares about "Date" in the property name.
 *
 * This function will use just the title in parenthesis for the data set property name.
 */
function dateDataSetProperty(title: string, nameScope: TakenNamesSet = GlobalNameScope): string {
    const datasetStart = title.lastIndexOf("(");

    if (datasetStart === -1) {
        return uniqueVariable(title, nameScope);
    }

    return uniqueVariable(title.substr(datasetStart), nameScope);
}

function dateDataSetAttributeProperty(title: string, nameScope: TakenNamesSet = GlobalNameScope): string {
    const datasetStart = title.lastIndexOf("(");

    if (datasetStart === -1) {
        return uniqueVariable(title, nameScope);
    }

    return uniqueVariable(title.substr(0, datasetStart), nameScope);
}

/**
 * This is a wrapper on top of uniqueVariable and is useful when naming date data set attributes. They have
 * a convention where date data set name is in parenthesis at the end of the attr/df title. This function
 * takes the ds name and moves it at the beginning of the title. That way all variables for same date data set
 * start with the same prefix.
 *
 * @param title - title to play with
 * @param nameScope - scope containing already taken variable names
 */
function dateAttributeSwitcharoo(title: string, nameScope: TakenNamesSet = GlobalNameScope): string {
    const datasetStart = title.lastIndexOf("(");

    if (datasetStart === -1) {
        return uniqueVariable(title, nameScope);
    }

    const switchedTitle = `${title.substr(datasetStart)} ${title.substr(0, datasetStart)}`;

    return uniqueVariable(switchedTitle, nameScope);
}

/**
 * This is a wrapper on top of uniqueVariable and is useful for stripping date data set display forms off
 * superfluous stuff such as example format & date dimension name. It assumes that the format of
 * display form names is "Something (Example) (DD Name)"
 *
 * @param title - display form title
 * @param nameScope - name scope in which to keep var names unique
 */
function dateDisplayFormStrip(title: string, nameScope: TakenNamesSet = GlobalNameScope): string {
    const metaStart = title.indexOf("(");

    return uniqueVariable(title.substr(0, metaStart), nameScope);
}

//
// Transformation to ts-morph structures
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

function generateSdkModelImports(): OptionalKind<ImportDeclarationStructure> {
    return {
        moduleSpecifier: "@gooddata/sdk-model",
        namedImports: ["newAttribute", "newMeasure", "IAttribute", "IMeasure", "IMeasureDefinition", "idRef"],
        leadingTrivia:
            "// @ts-ignore ignore unused imports here if they happen (e.g. when there is no measure in the workspace)",
    };
}

function generateAttributeDisplayForm(
    displayForm: DisplayForm,
    attributeVariableName: string,
    nameScope: TakenNamesSet,
    naming: NamingStrategies,
): string {
    const { meta } = displayForm;
    const dfVariableName = naming.displayForm(meta.title, nameScope);
    let variableName = attributeVariableName === dfVariableName ? "Default" : dfVariableName;

    if (variableName.startsWith(attributeVariableName)) {
        // we need to do the variable conversion again as it can happen that after removing the attribute name what is left starts with a number
        // for example Foo attribute and Foo123Bar display form becomes 123Bar which is invalid in this context
        variableName = stringToVariableName(variableName.substr(attributeVariableName.length));
    }

    return `/** \n* Display Form Title: ${meta.title}  \n* Display Form ID: ${meta.identifier}\n*/\n${variableName}: newAttribute('${meta.identifier}')`;
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
): string[] {
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
): OptionalKind<VariableStatementStructure> {
    const { meta } = attribute.attribute;
    const variableName = naming.attribute(meta.title, GlobalNameScope);
    const { displayForms } = attribute.attribute.content;
    const comments = [`Attribute Title: ${meta.title}`, `Attribute ID: ${meta.identifier}`];

    const docs = [comments.join("\n")];

    if (displayForms.length === 1) {
        /*
         * If there is a single DF for the attribute, then have const AttrName = newAttribute(...)
         */
        const displayForm = displayForms[0];

        return {
            declarationKind: VariableDeclarationKind.Const,
            isExported: true,
            docs,
            declarations: [
                {
                    name: variableName,
                    type: "IAttribute",
                    initializer: `newAttribute('${displayForm.meta.identifier}')`,
                },
            ],
        };
    } else {
        /*
         * If there are multiple DFs, have mapping of const AttrName = { DfName: newAttribute(), OtherDfName: newAttribute()}
         */
        const displayFormInits: string[] = generateDisplayFormPropertyInitializers(
            attribute,
            variableName,
            naming,
        );

        return {
            declarationKind: VariableDeclarationKind.Const,
            isExported: true,
            docs,
            declarations: [
                {
                    name: variableName,
                    initializer: `{ ${displayFormInits.join(",")} }`,
                },
            ],
        };
    }
}

function generateAttributes(
    projectMeta: WorkspaceMetadata,
): ReadonlyArray<OptionalKind<VariableStatementStructure>> {
    return projectMeta.catalog.attributes.map((a) => generateAttributeConstant(a));
}

function generateMeasureFromMetric(metric: Metric): OptionalKind<VariableStatementStructure> {
    const { meta } = metric.metric;
    const variableName = uniqueVariable(meta.title);

    return {
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        docs: [`Metric Title: ${meta.title}\nMetric ID: ${meta.identifier}\nMetric Type: MAQL Metric`],
        declarations: [
            {
                name: variableName,
                type: "IMeasure<IMeasureDefinition>",
                initializer: `newMeasure(idRef('${meta.identifier}', "measure"))`,
            },
        ],
    };
}

function generateFactAggregations(fact: Fact): string[] {
    const { meta } = fact.fact;

    return FACT_AGGREGATIONS.map((aggregation) => {
        const jsDoc = `/** \n* Fact Title: ${meta.title}  \n* Fact ID: ${meta.identifier}\n * Fact Aggregation: ${aggregation}\n*/`;
        const name = aggregation.charAt(0).toUpperCase() + aggregation.substr(1);

        return `${jsDoc}\n${name}: newMeasure(idRef('${meta.identifier}', "fact"), m => m.aggregation('${aggregation}'))`;
    });
}

function generateMeasuresFromFacts(fact: Fact): OptionalKind<VariableStatementStructure> {
    const { meta } = fact.fact;
    const variableName = uniqueVariable(meta.title);

    const aggregationInits: string[] = generateFactAggregations(fact);

    return {
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        docs: [`Fact Title: ${meta.title}\nFact ID: ${meta.identifier}`],
        declarations: [
            {
                name: variableName,
                initializer: `{ ${aggregationInits.join(",")} } `,
            },
        ],
    };
}

/**
 * Generates simple measures from metrics and facts defined in the project.
 *
 * - For metrics (MAQL stuff) this will generate constant with MeasureTitle = newMeasure(id)
 * - For facts, this will generate constant initialized to an object which defines all possible
 *   aggregations of the measure.
 */
function generateMeasures(
    projectMeta: WorkspaceMetadata,
): ReadonlyArray<OptionalKind<VariableStatementStructure>> {
    const fromMetrics = projectMeta.catalog.metrics.map(generateMeasureFromMetric);
    const fromFacts = projectMeta.catalog.facts.map(generateMeasuresFromFacts);

    return fromMetrics.concat(fromFacts);
}

function generateDateDataSetAttributes(dd: DateDataSet, naming: NamingStrategies): string[] {
    const ddScope = {};

    return dd.dateDataSet.content.attributes.map((a) => {
        const { meta } = a.attribute;
        const { title, identifier } = meta;

        const attributePropertyName = naming.dataSetAttributeProperty(meta.title, ddScope);
        const jsDoc = `/** \n* Date Attribute: ${title}  \n* Date Attribute ID: ${identifier}\n*/`;
        const displayFormProps = generateDisplayFormPropertyInitializers(a, attributePropertyName, naming);

        return `${jsDoc}\n${attributePropertyName}: { ref: idRef('${identifier}', 'attribute'), identifier: '${identifier}', ${displayFormProps.join(
            ",",
        )} }`;
    });
}

function generateDateDataSetInitialzier(
    dd: DateDataSet,
    naming: NamingStrategies,
    namingScope: TakenNamesSet,
): string {
    const { title, identifier } = dd.dateDataSet.meta;
    const propName = naming.dataSetProperty(title, namingScope);
    const jsDoc = `/** \n* Date Data Set Title: ${title}  \n* Date Data Set ID: ${identifier}\n*/`;
    const attributes = generateDateDataSetAttributes(dd, naming);

    return `${jsDoc}\n${propName}: { ref: idRef('${identifier}', 'dataSet'), identifier: '${identifier}', ${attributes.join(
        ", ",
    )} }`;
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
function generateDateDataSetMapping(
    dds: DateDataSet[],
    naming: NamingStrategies,
): OptionalKind<VariableStatementStructure> {
    const mappingScope = {};
    const ddMappings = dds.map((dd) => generateDateDataSetInitialzier(dd, naming, mappingScope));

    return {
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        docs: ["Available Date Data Sets"],
        declarations: [
            {
                name: DATE_DATASETS_MAP_VARNAME,
                initializer: `{ ${ddMappings.join(", ")} }`,
            },
        ],
    };
}

function generateDateDataSets(
    projectMeta: WorkspaceMetadata,
    tiger: boolean,
): ReadonlyArray<OptionalKind<VariableStatementStructure>> {
    let naming = DateDataSetNaming;

    if (tiger) {
        naming = DefaultNaming;
    }

    return [generateDateDataSetMapping(projectMeta.dateDataSets, naming)];
}

/**
 * Declares a constant initialized to object mapping InsightTitle ⇒ insight identifier.
 *
 * @param projectMeta - project metadata containing the insights
 */
function generateInsights(projectMeta: WorkspaceMetadata): OptionalKind<VariableStatementStructure> {
    const insightInitializer: string[] = projectMeta.insights.map((insight) => {
        const propName = uniqueVariable(insight.title);
        const jsDoc = `/** \n* Insight Title: ${insight.title}  \n* Insight ID: ${insight.identifier}\n*/`;

        return `${jsDoc}\n${propName}: '${insight.identifier}'`;
    });

    return {
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
            {
                name: INSIGHT_MAP_VARNAME,
                initializer: `{ ${insightInitializer.join(",")} }`,
            },
        ],
    };
}

/**
 * Declares a constant initialized to object mapping analyticalDashboard ⇒ analyticalDashboard identifier.
 *
 * @param projectMeta - project metadata containing the analyticalDashboards
 */
function generateAnalyticalDashboards(
    projectMeta: WorkspaceMetadata,
): OptionalKind<VariableStatementStructure> {
    const analyticalDashboardInitializer: string[] = projectMeta.analyticalDashboards.map((dashboard) => {
        const propName = uniqueVariable(dashboard.title);
        const jsDoc = `/** \n* Dashboard Title: ${dashboard.title}  \n* Dashboard ID: ${dashboard.identifier}\n*/`;

        return `${jsDoc}\n${propName}: '${dashboard.identifier}'`;
    });

    return {
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
            {
                name: ANALYTICAL_DASHBOARD_MAP_VARNAME,
                initializer: `{ ${analyticalDashboardInitializer.join(",")} }`,
            },
        ],
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
 * @param tiger - indicates whether running against tiger, this influences naming strategy to use for date datasets as they are different from bear
 * @returns return of the transformation process, new file is not saved at this point
 */
export function transformToTypescript(
    projectMeta: WorkspaceMetadata,
    outputFile: string,
    tiger: boolean,
): TypescriptOutput {
    GlobalNameScope = {};

    const output = initialize(outputFile);
    const { sourceFile } = output;

    sourceFile.addImportDeclaration(generateSdkModelImports());
    sourceFile.addVariableStatements(generateAttributes(projectMeta));
    sourceFile.addVariableStatements(generateMeasures(projectMeta));
    sourceFile.addVariableStatements(generateDateDataSets(projectMeta, tiger));
    sourceFile.addVariableStatement(generateInsights(projectMeta));
    sourceFile.addVariableStatement(generateAnalyticalDashboards(projectMeta));

    return output;
}
