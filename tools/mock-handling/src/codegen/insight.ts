// (C) 2007-2025 GoodData Corporation

import * as path from "path";

import { groupBy } from "lodash-es";

import { type TakenNamesSet, createUniqueVariableName } from "../base/variableNaming.js";
import { type InsightRecording } from "../recordings/insights.js";

const InsightIndexConstName = "Insights";

//
// generating initializer for map of maps ... fun times.
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

function generateInsightsConst(recordings: InsightRecording[]): string {
    const recsWithVisAndScenario: VisScenarioToInsight[] = recordings
        .filter((rec) => rec.hasVisAndScenarioInfo())
        .map((rec) => [rec.getVisName(), rec.getScenarioName(), rec]);

    const entriesByVis = Object.entries(groupBy(recsWithVisAndScenario, ([visName]) => visName));
    const entryRows = entriesByVis
        .map(([vis, visScenarios]) => `${vis}: ${generateScenarioForVis(visScenarios)}`)
        .join(",");

    return `export const ${InsightIndexConstName} = { ${entryRows} };`;
}

/**
 * Generate constants for insight recordings. This function will return non-exported constant per recording.
 *
 * @param recordings - recordings to generate constants for
 * @param targetDir - absolute path to directory where index will be stored, this is needed so that paths can be
 *   made relative for require()
 */
export function generateConstantsForInsights(recordings: InsightRecording[], targetDir: string): string[] {
    return [
        ...recordings
            .map((r) => {
                const entries = Object.entries(r.getEntryForRecordingIndex());

                const recordingName = r.getRecordingName();

                const entryPairs = entries.map(([type, _]) => `${type}: ${recordingName}_${type}`).join(",");

                return [
                    ...entries.map(
                        ([type, file]) =>
                            `import ${recordingName}_${type} from "./${path.relative(targetDir, file)}" with { type: "json" };`,
                    ),
                    `const ${recordingName} = { ${entryPairs} };`,
                ];
            })
            .reduce((acc, curr) => acc.concat(curr), []),
        generateInsightsConst(recordings),
    ];
}
