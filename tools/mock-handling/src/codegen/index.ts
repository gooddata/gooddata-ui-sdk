// (C) 2007-2019 GoodData Corporation

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
import { generateConstantsForExecutions } from "./execution";
import { ExecutionRecording } from "../recordings/execution";
import { IRecording, RecordingType } from "../recordings/common";
import { DisplayFormRecording } from "../recordings/displayForms";
import { generateConstantsForDisplayForms } from "./displayForm";
import groupBy = require("lodash/groupBy");

const FILE_DIRECTIVES = ["/* tslint:disable:file-header */", "/* tslint:disable:variable-name */"];
const FILE_HEADER = `/* THIS FILE WAS AUTO-GENERATED USING MOCK HANDLING TOOL; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: ${new Date().toISOString()}; */`;

const MainIndexConstName = "Recordings";

//
//
//

type TypescriptOutput = {
    project: Project;
    sourceFile: SourceFile;
};

function initialize(targetDir: string): TypescriptOutput {
    const outputFile = path.join(targetDir, "index.ts");
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

function generateIndexConst(input: IndexGeneratorInput): OptionalKind<VariableStatementStructure> {
    const executionsInit = `executions: {${input
        .executions()
        .map(e => e.getRecordingName())
        .join(",")}}`;
    const validElementsInit = `metadata: { displayForms: {${input
        .displayForms()
        .map(e => e.getRecordingName())
        .join(",")}}}`;

    return {
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
            {
                name: MainIndexConstName,
                initializer: `{ ${executionsInit}, ${validElementsInit} }`,
            },
        ],
    };
}

function transformToTypescript(input: IndexGeneratorInput, targetDir: string): TypescriptOutput {
    const output = initialize(targetDir);
    const { sourceFile } = output;

    sourceFile.addVariableStatements(generateConstantsForExecutions(input.executions(), targetDir));
    sourceFile.addVariableStatements(generateConstantsForDisplayForms(input.displayForms(), targetDir));
    sourceFile.addVariableStatement(generateIndexConst(input));

    return output;
}

/**
 * Input to TS codegen that creates index with pointers to all recordings.
 */
type IndexGeneratorInput = {
    executions: () => ExecutionRecording[];
    displayForms: () => DisplayFormRecording[];
};

function createGeneratorInput(recordings: IRecording[]): IndexGeneratorInput {
    const categorized = groupBy(recordings, rec => rec.getRecordingType());

    return {
        executions: () => {
            return (categorized[RecordingType.Execution] as ExecutionRecording[]) || [];
        },
        displayForms: () => {
            return (categorized[RecordingType.DisplayForms] as DisplayFormRecording[]) || [];
        },
    };
}

/**
 * Given various types of recordings, this function will generate and write `index.ts` file in the root of
 * the recordings directory.
 *
 * The index will use require() to reference the JSON files. It is assumed that all paths on input to this function
 * are absolute, the code will relativize paths as needed.
 *
 * @param recordings - recordings to include in the index
 * @param targetDir - absolute path to directory where the index should be created
 */
export function generateRecordingIndex(recordings: IRecording[], targetDir: string): void {
    const input = createGeneratorInput(recordings);
    const output = transformToTypescript(input, targetDir);
    const { sourceFile } = output;
    const generatedTypescript = sourceFile.getFullText();
    const formattedTypescript = format(generatedTypescript, { parser: "typescript", printWidth: 120 });

    fs.writeFileSync(sourceFile.getFilePath(), formattedTypescript, { encoding: "utf-8" });
}
