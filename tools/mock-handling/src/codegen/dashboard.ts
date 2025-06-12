// (C) 2007-2021 GoodData Corporation

import * as path from "path";
import { OptionalKind, VariableDeclarationKind, VariableStatementStructure } from "ts-morph";
import { DashboardRecording } from "../recordings/dashboards.js";

function displayFormRecordingInit(rec: DashboardRecording, targetDir: string): string {
    const entries = Object.entries(rec.getEntryForRecordingIndex());

    const entryRows = entries
        .map(([type, file]) => `${type}: require('./${path.relative(targetDir, file)}')`)
        .join(",");

    return `{ ${entryRows} }`;
}

function generateRecordingConst(
    rec: DashboardRecording,
    targetDir: string,
): OptionalKind<VariableStatementStructure> {
    return {
        declarationKind: VariableDeclarationKind.Const,
        isExported: false,
        declarations: [
            {
                name: rec.getRecordingName(),
                initializer: displayFormRecordingInit(rec, targetDir),
            },
        ],
    };
}

/**
 * Generate constants for the dashboard recordings. This function will return non-exported constant per recording.
 *
 * @param recordings - recordings to generate constants for
 * @param targetDir - absolute path to directory where index will be stored, this is needed so that paths can be
 *   made relative for require()
 */
export function generateConstantsForDashboards(
    recordings: DashboardRecording[],
    targetDir: string,
): Array<OptionalKind<VariableStatementStructure>> {
    return recordings.map((r) => generateRecordingConst(r, targetDir));
}
