// (C) 2007-2019 GoodData Corporation
import { Attribute, DateDataSet, DisplayForm, Fact, Metric, ProjectMetadata } from "../base/types";
import {
    ImportDeclarationStructure,
    OptionalKind,
    Project,
    SourceFile,
    VariableDeclarationKind,
    VariableStatementStructure,
} from "ts-morph";
import { createUniqueVariableName, TakenNamesMap } from "./titles";
import { flatMap } from "lodash";

export type TypescriptOutput = {
    project: Project;
    sourceFile: SourceFile;
};

//
// Internal functions to build variable names for various
//

let GlobalNameScope: TakenNamesMap = {};

type NamingStrategy = (title: string, scope: TakenNamesMap) => string;

type AttributeNaming = {
    attribute: NamingStrategy;
    displayForm: NamingStrategy;
};

const DefaultNaming: AttributeNaming = {
    attribute: uniqueVariable,
    displayForm: uniqueVariable,
};

const DateDataSetNaming: AttributeNaming = {
    attribute: dateAttributeSwitcharoo,
    displayForm: dateDisplayFormStrip,
};

/**
 * This is a wrapper on top of createUniqueVariableName() which mutates the input map of used
 * variable names.
 *
 * @param title - md object title
 * @param nameScope - scope containing already taken variable names, defaults to global scope
 */
function uniqueVariable(title: string, nameScope: TakenNamesMap = GlobalNameScope): string {
    const variableName = createUniqueVariableName(title, nameScope);
    nameScope[variableName] = true;

    return variableName;
}

/**
 * This is a wrapper on top of uniqueVariable. It is useful when naming date data set attributes. They have
 * a convention where date data set name is in parenthesis at the end of the attr/df title. This function
 * takes the ds name and moves it at the beginning of the title. That way all variables for same date data set
 * start with the same prefix.
 *
 * @param title - title to play with
 * @param nameScope - scope containing already taken variable names
 */
function dateAttributeSwitcharoo(title: string, nameScope: TakenNamesMap = GlobalNameScope): string {
    const datasetStart = title.lastIndexOf("(");
    const switchedTitle = `${title.substr(datasetStart)} ${title.substr(0, datasetStart)}`;

    return uniqueVariable(switchedTitle, nameScope);
}

function dateDisplayFormStrip(title: string, nameScope: TakenNamesMap = GlobalNameScope): string {
    const metaStart = title.indexOf("(");

    return uniqueVariable(title.substr(0, metaStart), nameScope);
}

//
// Transformation to ts-morph structures
//

function initialize(outputFile: string): TypescriptOutput {
    const project = new Project({});
    const sourceFile = project.createSourceFile(outputFile);

    return {
        project,
        sourceFile,
    };
}

function generateSdkModelImports(): OptionalKind<ImportDeclarationStructure> {
    return {
        moduleSpecifier: "@gooddata/sdk-model",
        namedImports: ["newAttribute", "newMeasure", "IAttribute", "IMeasure", "IMeasureDefinition"],
    };
}

function generateAttributeDisplayForm(
    displayForm: DisplayForm,
    attributeVariableName: string,
    nameScope: TakenNamesMap,
    naming: AttributeNaming,
): string {
    const { meta } = displayForm;
    const dfVariableName = naming.displayForm(meta.title, nameScope);
    let variableName = attributeVariableName === dfVariableName ? "Default" : dfVariableName;

    if (variableName.startsWith(attributeVariableName)) {
        variableName = variableName.substr(attributeVariableName.length);
    }

    return `/** \n* Display Form Title: ${meta.title}  \n* Display Form ID: ${meta.identifier}\n*/\n${variableName}: newAttribute('${meta.identifier}')`;
}

function generateAttribute(
    attribute: Attribute,
    naming: AttributeNaming = DefaultNaming,
): OptionalKind<VariableStatementStructure> {
    const { meta } = attribute.attribute;
    const variableName = naming.attribute(meta.title, GlobalNameScope);
    const { displayForms } = attribute.attribute.content;

    if (displayForms.length === 1) {
        /*
         * If there is a single DF for the attribute, then have const AttrName = newAttribute(...)
         */
        const displayForm = displayForms[0];

        return {
            declarationKind: VariableDeclarationKind.Const,
            isExported: true,
            docs: [`Attribute Title: ${meta.title}\nDisplay Form ID: ${meta.identifier}`],
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
        const localNameScope: TakenNamesMap = {};
        const displayFormInits: string[] = attribute.attribute.content.displayForms.map(df =>
            generateAttributeDisplayForm(df, variableName, localNameScope, naming),
        );

        return {
            declarationKind: VariableDeclarationKind.Const,
            isExported: true,
            declarations: [
                {
                    name: variableName,
                    type: "{[df: string]: IAttribute}",
                    initializer: `{ ${displayFormInits.join(",")} }`,
                },
            ],
        };
    }
}

function generateAttributes(
    projectMeta: ProjectMetadata,
): ReadonlyArray<OptionalKind<VariableStatementStructure>> {
    return projectMeta.catalog.attributes.map(a => generateAttribute(a));
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
                initializer: `newMeasure('${metric.metric.meta.identifier}')`,
            },
        ],
    };
}

const aggregations = ["sum", "count", "avg", "min", "max", "median", "runsum"];

function generateFactAggregations(fact: Fact): string[] {
    const { meta } = fact.fact;

    return aggregations.map(aggregation => {
        const jsDoc = `/** \n* Fact Title: ${meta.title}  \n* Fact ID: ${meta.identifier}\n * Fact Aggregation: ${aggregation}\n*/`;
        const name = aggregation.charAt(0).toUpperCase() + aggregation.substr(1);

        return `${jsDoc}\n${name}: newMeasure('${meta.identifier}', m => m.aggregation('${aggregation}'))`;
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
                type: "{[measure: string]: IMeasure<IMeasureDefinition>}",
                initializer: `{ ${aggregationInits.join(",")} } `,
            },
        ],
    };
}

function generateMeasures(
    projectMeta: ProjectMetadata,
): ReadonlyArray<OptionalKind<VariableStatementStructure>> {
    const fromMetrics = projectMeta.catalog.metrics.map(generateMeasureFromMetric);
    const fromFacts = projectMeta.catalog.facts.map(generateMeasuresFromFacts);

    return fromMetrics.concat(fromFacts);
}

function generateDateDataSet(dd: DateDataSet): ReadonlyArray<OptionalKind<VariableStatementStructure>> {
    const { content } = dd.dateDataSet;

    return content.attributes.map(a => generateAttribute(a, DateDataSetNaming));
}

function generateDateDataSets(
    projectMeta: ProjectMetadata,
): ReadonlyArray<OptionalKind<VariableStatementStructure>> {
    return flatMap(projectMeta.dateDataSets.map(generateDateDataSet));
}

/**
 * Transforms project metadata into model definitions in TypeScript. The resulting TS source file will contain
 * constant declarations for the various objects in the metadata:
 *
 * - Attributes with single display form are transformed to constants initialized with respective newAttribute()
 * - Attributes with multiple display forms are transformed to constants initialized to map of df name => newAttribute()
 * - Metrics (MAQL) will be transformed to constants initialized with respective newMeasure()
 * - Metrics from facts will be transformed to constants initialized to map of aggregation => newMeasure()
 * - Date data set attributes will be transformed using the same logic as normal attributes, albeit with slightly
 *   modified variable naming strategy
 *
 * @param projectMeta - project metadata to transform to typescript
 * @param outputFile - output typescript file
 * @return return of the transformation process, new file is not saved at this point
 */
export async function transformToTypescript(
    projectMeta: ProjectMetadata,
    outputFile: string,
): Promise<TypescriptOutput> {
    GlobalNameScope = {};

    const output = initialize(outputFile);
    const { sourceFile } = output;

    sourceFile.addImportDeclaration(generateSdkModelImports());
    sourceFile.addVariableStatements(generateAttributes(projectMeta));
    sourceFile.addVariableStatements(generateMeasures(projectMeta));
    sourceFile.addVariableStatements(generateDateDataSets(projectMeta));

    return output;
}
