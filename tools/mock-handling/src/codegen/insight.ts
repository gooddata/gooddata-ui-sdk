// (C) 2007-2020 GoodData Corporation

import * as path from "path";
import { OptionalKind, VariableDeclarationKind, VariableStatementStructure } from "ts-morph";
import { createUniqueVariableName, TakenNamesSet } from "../base/variableNaming.js";
import { InsightRecording } from "../recordings/insights.js";
import groupBy from "lodash/groupBy.js";

const InsightIndexConstName = "Insights";

function insightRecordingInit(rec: InsightRecording, targetDir: string): string {
    const entries = Object.entries(rec.getEntryForRecordingIndex());

    const entryPairs = entries
        .map(([type, file]) => `${type}: require('./${path.relative(targetDir, file)}')`)
        .join(",");

    return `{ ${entryPairs} }`;
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

    const entryRows = entries
        .map(([_, entryName, entryRecording]) => {
            const varName = createUniqueVariableName(entryName, scope);
            scope[varName] = true;

            return `${varName}: ${entryRecording.getRecordingName()}`;
        })
        .join(",");

    return `{ ${entryRows} }`;
}

function generateInsightsConst(recordings: InsightRecording[]): OptionalKind<VariableStatementStructure> {
    const recsWithVisAndScenario: VisScenarioToInsight[] = recordings
        .filter((rec) => rec.hasVisAndScenarioInfo())
        .map((rec) => [rec.getVisName(), rec.getScenarioName(), rec]);

    const entriesByVis = Object.entries(groupBy(recsWithVisAndScenario, ([visName]) => visName));
    const entryRows = entriesByVis
        .map(([vis, visScenarios]) => `${vis}: ${generateScenarioForVis(visScenarios)}`)
        .join(",");

    return {
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
            {
                name: InsightIndexConstName,
                initializer: `{ ${entryRows} }`,
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
