// (C) 2007-2019 GoodData Corporation
import { Attribute, DisplayForm, Fact, Metric, ProjectMetadata } from "../base/types";
import {
    ImportDeclarationStructure,
    OptionalKind,
    Project,
    SourceFile,
    VariableDeclarationKind,
    VariableStatementStructure,
} from "ts-morph";
import { createUniqueVariableName, TakenNamesMap } from "./titles";

type TypescriptOutput = {
    project: Project;
    sourceFile: SourceFile;
};

let TakenVariableNames: TakenNamesMap = {};

/**
 * This is a wrapper on top of createUniqueVariableName() which mutates the input map of used
 * variable names.
 *
 * @param title - md object title
 * @param takenMap - map of taken names, defaults to the global TakenVariableNames
 */
function uniqueVariable(title: string, takenMap: TakenNamesMap = TakenVariableNames): string {
    const variableName = createUniqueVariableName(title, takenMap);
    TakenVariableNames[variableName] = true;

    return variableName;
}

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

function generateAttributeDisplayForm(displayForm: DisplayForm, attributeVariableName: string): string {
    const localNameScope: TakenNamesMap = {};
    const { meta } = displayForm;
    const dfVariableName = uniqueVariable(meta.title, localNameScope);
    let variableName = attributeVariableName === dfVariableName ? "Default" : dfVariableName;

    if (variableName.startsWith(attributeVariableName)) {
        variableName = variableName.substr(attributeVariableName.length);
    }

    return `/** \n* Display Form Title: ${meta.title}  \n* Display Form ID: ${meta.identifier}\n*/\n${variableName}: newAttribute('${meta.identifier}')`;
}

function generateAttribute(attribute: Attribute): OptionalKind<VariableStatementStructure> {
    const { meta } = attribute.attribute;
    const variableName = uniqueVariable(meta.title);
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
        const displayFormInits: string[] = attribute.attribute.content.displayForms.map(df =>
            generateAttributeDisplayForm(df, variableName),
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
    return projectMeta.catalog.attributes.map(generateAttribute);
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

export async function transformToTypescript(projectMeta: ProjectMetadata, outputFile: string): Promise<void> {
    TakenVariableNames = {};

    const output = initialize(outputFile);
    const { sourceFile } = output;

    sourceFile.addImportDeclaration(generateSdkModelImports());
    sourceFile.addVariableStatements(generateAttributes(projectMeta));
    sourceFile.addVariableStatements(generateMeasures(projectMeta));

    return output.project.save();
}
