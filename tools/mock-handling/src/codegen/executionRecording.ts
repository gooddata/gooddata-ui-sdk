// (C) 2007-2019 GoodData Corporation

import * as path from "path";
import { OptionalKind, VariableDeclarationKind, VariableStatementStructure } from "ts-morph";
import { IExecutionRecording } from "../recordings/execution";
import { createUniqueVariableName, executionRecordingName } from "./variableNaming";
import flatMap = require("lodash/flatMap");
import groupBy = require("lodash/groupBy");

const ScenariosConstName = "Scenarios";

function executionRecordingInit(rec: IExecutionRecording, targetDir: string): string {
    const definition = `require('./${path.relative(targetDir, rec.definitionFile)}')`;
    const executionResult = `require('./${path.relative(targetDir, rec.resultFile)}')`;
    const dataViewAll = `require('./${path.relative(targetDir, rec.dataViewFile)}')`;

    return `{ definition: ${definition}, executionResult: ${executionResult}, dataViewAll: ${dataViewAll} }`;
}

function generateRecordingConst(
    rec: IExecutionRecording,
    targetDir: string,
): OptionalKind<VariableStatementStructure> {
    return {
        declarationKind: VariableDeclarationKind.Const,
        isExported: false,
        declarations: [
            {
                name: executionRecordingName(rec),
                initializer: executionRecordingInit(rec, targetDir),
            },
        ],
    };
}

//
// generating initializer for map of maps .. fun times.
//

type VisScenarioRecording = [string, string, IExecutionRecording];

function generateScenarioForVis(entries: VisScenarioRecording[]): string {
    return `{ ${entries
        .map(e => `${createUniqueVariableName(e[1], {})}: ${executionRecordingName(e[2])}`)
        .join(",")} }`;
}

function generateScenariosConst(recordings: IExecutionRecording[]): OptionalKind<VariableStatementStructure> {
    const recsWithVisAndScenario = flatMap(recordings, rec =>
        rec.scenarios.map<VisScenarioRecording>(s => [s.vis, s.scenario, rec]),
    );
    const entriesByVis = Object.entries(groupBy(recsWithVisAndScenario, r => r[0]));

    return {
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
            {
                name: ScenariosConstName,
                initializer: `{ ${entriesByVis
                    .map(e => `${e[0]}: ${generateScenarioForVis(e[1])}`)
                    .join(",")} }`,
            },
        ],
    };
}

/**
 * Generate constants for the execution recordings. This function will return non-exported constant per recording
 * and then also an exported 'Scenarios' constant that is a map from vis => scenario => recording.
 *
 * @param recordings - recordings to generate constants for
 * @param targetDir - absolute path to directory where index will be stored, this is needed so that paths can be
 *   relativized from require()
 */
export function generateConstantsForExecutions(
    recordings: IExecutionRecording[],
    targetDir: string,
): Array<OptionalKind<VariableStatementStructure>> {
    return [...recordings.map(r => generateRecordingConst(r, targetDir)), generateScenariosConst(recordings)];
}
