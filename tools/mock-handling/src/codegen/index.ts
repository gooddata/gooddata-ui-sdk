// (C) 2007-2021 GoodData Corporation

import * as fs from "fs";
import * as path from "path";
import { format } from "prettier";
import {
    OptionalKind,
    Project,
    SourceFile,
    VariableDeclarationKind,
    VariableStatementStructure,
} from "ts-morph";
import { IRecording, RecordingType } from "../recordings/common.js";
import { DisplayFormRecording } from "../recordings/displayForms.js";
import { ExecutionRecording } from "../recordings/execution.js";
import { InsightRecording } from "../recordings/insights.js";
import { CatalogRecording } from "../recordings/catalog.js";
import { VisClassesRecording } from "../recordings/visClasses.js";
import { generateConstantsForDisplayForms } from "./displayForm.js";
import { generateConstantsForDataSamples } from "./dataSample.js";
import { generateConstantsForExecutions } from "./execution.js";
import { generateConstantsForInsights } from "./insight.js";
import { generateConstantsForCatalog } from "./catalog.js";
import { generateConstantsForVisClasses } from "./visClasses.js";
import groupBy from "lodash/groupBy.js";
import { generateConstantsForDashboards } from "./dashboard.js";
import { DashboardRecording } from "../recordings/dashboards.js";

const FILE_DIRECTIVES = [
    "/* eslint-disable @typescript-eslint/no-var-requires */",
    "/* eslint-disable header/header */",
];
const FILE_HEADER = `/* THIS FILE WAS AUTO-GENERATED USING MOCK HANDLING TOOL; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: ${new Date().toISOString()}; */`;

const MainIndexConstName = "Recordings";

//
//
//

type TypescriptOutput = {
    project: Project;
    sourceFile: SourceFile;
};

function initialize(targetDir: string, fileName: string): TypescriptOutput {
    const outputFile = path.join(targetDir, fileName);
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

function recNameList(recs: IRecording[]): string {
    return recs.map((r) => r.getRecordingName()).join(",");
}

function generateIndexConst(input: IndexGeneratorInput): OptionalKind<VariableStatementStructure> {
    const executionsInit = `executions: {${input
        .executions()
        .map((e) => e.getRecordingName())
        .filter((value, index, array) => array.indexOf(value) === index)
        .join(",")}}`;

    const metadataInit = `
        metadata: {
            ${input.catalog() !== null ? "catalog," : ""}
            ${input.visClasses() !== null ? "visClasses," : ""}
            displayForms: { ${recNameList(input.displayForms())} },
            insights: { ${recNameList(input.insights())} },
            dashboards: { ${recNameList(input.dashboards())} }
        }
    `;

    return {
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
            {
                name: MainIndexConstName,
                initializer: `{ ${executionsInit}, ${metadataInit} }`,
            },
        ],
    };
}

function transformToTypescript(
    input: IndexGeneratorInput,
    targetDir: string,
    fileName: string,
): TypescriptOutput {
    const output = initialize(targetDir, fileName);
    const sourceFile = output.sourceFile;

    if (fileName === "dataSample.ts") {
        sourceFile.addVariableStatements(generateConstantsForDataSamples(input.displayForms(), targetDir));
    } else {
        sourceFile.addVariableStatements(generateConstantsForExecutions(input.executions(), targetDir));
        sourceFile.addVariableStatements(generateConstantsForDisplayForms(input.displayForms(), targetDir));
        sourceFile.addVariableStatements(generateConstantsForInsights(input.insights(), targetDir));
        sourceFile.addVariableStatements(generateConstantsForCatalog(input.catalog(), targetDir));
        sourceFile.addVariableStatements(generateConstantsForVisClasses(input.visClasses(), targetDir));
        sourceFile.addVariableStatements(generateConstantsForDashboards(input.dashboards(), targetDir));
        sourceFile.addVariableStatement(generateIndexConst(input));
    }

    return output;
}

/**
 * Input to TS codegen that creates index with pointers to all recordings.
 */
type IndexGeneratorInput = {
    executions: () => ExecutionRecording[];
    displayForms: () => DisplayFormRecording[];
    insights: () => InsightRecording[];
    catalog: () => CatalogRecording | null;
    visClasses: () => VisClassesRecording | null;
    dashboards: () => DashboardRecording[];
};

function createGeneratorInput(recordings: IRecording[]): IndexGeneratorInput {
    const categorized = groupBy(recordings, (rec) => rec.getRecordingType());

    return {
        executions: () => {
            return (categorized[RecordingType.Execution] as unknown as ExecutionRecording[]) || [];
        },
        displayForms: () => {
            return (categorized[RecordingType.DisplayForms] as unknown as DisplayFormRecording[]) || [];
        },
        insights: () => {
            return (categorized[RecordingType.Insights] as unknown as InsightRecording[]) || [];
        },
        catalog: () =>
            (categorized[RecordingType.Catalog] &&
                (categorized[RecordingType.Catalog][0] as unknown as CatalogRecording)) ||
            null,
        visClasses: () =>
            (categorized[RecordingType.VisClasses] &&
                (categorized[RecordingType.VisClasses][0] as VisClassesRecording)) ||
            null,
        dashboards: () => {
            return (categorized[RecordingType.Dashboards] as unknown as DashboardRecording[]) || [];
        },
    };
}

function generateRecordingIndex(recordings: IRecording[], targetDir: string): void {
    const input = createGeneratorInput(recordings);
    const output = transformToTypescript(input, targetDir, "index.ts");
    const sourceFile = output.sourceFile;
    const generatedTypescript = sourceFile.getFullText();
    const formattedTypescript = format(generatedTypescript, { parser: "typescript", printWidth: 120 });

    fs.writeFileSync(sourceFile.getFilePath(), formattedTypescript, { encoding: "utf-8" });
}

function generateDataSample(recordings: IRecording[], targetDir: string): void {
    const input = createGeneratorInput(recordings);
    const output = transformToTypescript(input, targetDir, "dataSample.ts");
    const sourceFile = output.sourceFile;
    const generatedTypescriptForDataSample = sourceFile.getFullText();
    const formattedTypescriptForDataSample = format(generatedTypescriptForDataSample, {
        parser: "typescript",
        printWidth: 120,
    });

    fs.writeFileSync(sourceFile.getFilePath(), formattedTypescriptForDataSample, { encoding: "utf-8" });
}

/**
 * Given various types of recordings, this function will generate and write `dataSample.ts and index.ts` file in the root of
 * the recordings directory.
 *
 * The index will use require() to reference the JSON files. It is assumed that all paths on input to this function
 * are absolute, the code will relativize paths as needed.
 *
 * @param recordings - recordings to include in the index
 * @param targetDir - absolute path to directory where the index should be created
 */

export function generateAllFiles(recordings: IRecording[], targetDir: string): void {
    generateRecordingIndex(recordings, targetDir);
    generateDataSample(recordings, targetDir);
}
