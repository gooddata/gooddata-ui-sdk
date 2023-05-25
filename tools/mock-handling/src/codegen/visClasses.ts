// (C) 2020 GoodData Corporation
import * as path from "path";
import { OptionalKind, VariableDeclarationKind, VariableStatementStructure } from "ts-morph";
import compact from "lodash/compact.js";
import { VisClassesRecording } from "../recordings/visClasses.js";

function visClassesRecordingInit(rec: VisClassesRecording, targetDir: string): string {
    const entries = Object.entries(rec.getEntryForRecordingIndex());

    const entryRows = entries
        .map(([type, file]) => `${type}: require('./${path.relative(targetDir, file)}')`)
        .join(",");

    return `{ ${entryRows} }`;
}

function generateRecordingConst(
    rec: VisClassesRecording,
    targetDir: string,
): OptionalKind<VariableStatementStructure> {
    return {
        declarationKind: VariableDeclarationKind.Const,
        isExported: false,
        declarations: [
            {
                name: rec.getRecordingName(),
                initializer: visClassesRecordingInit(rec, targetDir),
            },
        ],
    };
}

/**
 * Generate constants for visClasses recording. This function will return non-exported constant per recording.
 *
 * @param recording - recording to generate constants for
 * @param targetDir - absolute path to directory where index will be stored, this is needed so that paths can be
 *   made relative for require()
 */
export function generateConstantsForVisClasses(
    recording: VisClassesRecording | null,
    targetDir: string,
): Array<OptionalKind<VariableStatementStructure>> {
    return compact([recording && generateRecordingConst(recording, targetDir)]);
}
