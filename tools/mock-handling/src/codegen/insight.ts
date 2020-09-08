// (C) 2007-2020 GoodData Corporation

import * as path from "path";
import { OptionalKind, VariableDeclarationKind, VariableStatementStructure } from "ts-morph";
import { createUniqueVariableName, TakenNamesSet } from "../base/variableNaming";
import { InsightRecording } from "../recordings/insights";
import groupBy from "lodash/groupBy";

const InsightIndexConstName = "Insights";

function insightRecordingInit(rec: InsightRecording, targetDir: string): string {
    const entries = Object.entries(rec.getEntryForRecordingIndex());

    return `{ ${entries
        .map(([type, file]) => `${type}: require('./${path.relative(targetDir, file)}')`)
        .join(",")} }`;
}

function generateRecordingConst(
    rec: InsightRecording,
    targetDir: string,
): OptionalKind<VariableStatementStructure> {
    return {
        declarationKind: VariableDeclarationKind.Const,
        isExported: false,
        declarations: [
            {
                name: rec.getRecordingName(),
                initializer: insightRecordingInit(rec, targetDir),
            },
        ],
    };
}

//
// generating initializer for map of maps .. fun times.
//

type VisScenarioToInsight = [string, string, InsightRecording];

function generateScenarioForVis(entries: VisScenarioToInsight[]): string {
    const scope: TakenNamesSet = {};

    return `{ ${entries
        .map(([_, entryName, entryRecording]) => {
            const varName = createUniqueVariableName(entryName, scope);
            scope[varName] = true;

            return `${varName}: ${entryRecording.getRecordingName()}`;
        })
        .join(",")} }`;
}

function generateInsightsConst(recordings: InsightRecording[]): OptionalKind<VariableStatementStructure> {
    const recsWithVisAndScenario: VisScenarioToInsight[] = recordings
        .filter((rec) => rec.hasVisAndScenarioInfo())
        .map((rec) => [rec.getVisName(), rec.getScenarioName(), rec]);

    const entriesByVis = Object.entries(groupBy(recsWithVisAndScenario, ([visName]) => visName));

    return {
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
            {
                name: InsightIndexConstName,
                initializer: `{ ${entriesByVis
                    .map(([vis, visScenarios]) => `${vis}: ${generateScenarioForVis(visScenarios)}`)
                    .join(",")} }`,
            },
        ],
    };
}

/**
 * Generate constants for insight recordings. This function will return non-exported constant per recording.
 *
 * @param recordings - recordings to generate constants for
 * @param targetDir - absolute path to directory where index will be stored, this is needed so that paths can be
 *   made relative for require()
 */
export function generateConstantsForInsights(
    recordings: InsightRecording[],
    targetDir: string,
): Array<OptionalKind<VariableStatementStructure>> {
    return [
        ...recordings.map((r) => generateRecordingConst(r, targetDir)),
        generateInsightsConst(recordings),
    ];
}
