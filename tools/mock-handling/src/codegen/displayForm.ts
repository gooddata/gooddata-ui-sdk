// (C) 2007-2020 GoodData Corporation

import * as path from "path";
import { OptionalKind, VariableDeclarationKind, VariableStatementStructure } from "ts-morph";
import { DisplayFormRecording } from "../recordings/displayForms.js";

function displayFormRecordingInit(rec: DisplayFormRecording, targetDir: string): string {
    const entries = Object.entries(rec.getEntryForRecordingIndex());

    const entryRows = entries
        .map(([type, file]) => `${type}: require('./${path.relative(targetDir, file)}')`)
        .join(",");

    return `{ ${entryRows} }`;
}

function generateRecordingConst(
    rec: DisplayFormRecording,
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
 * Generate constants for the valid element recordings. This function will return non-exported constant per recording.
 *
 * @param recordings - recordings to generate constants for
 * @param targetDir - absolute path to directory where index will be stored, this is needed so that paths can be
 *   made relative for require()
 */
export function generateConstantsForDisplayForms(
    recordings: DisplayFormRecording[],
    targetDir: string,
): Array<OptionalKind<VariableStatementStructure>> {
    return recordings.map((r) => generateRecordingConst(r, targetDir));
}
