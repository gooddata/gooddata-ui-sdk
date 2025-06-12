// (C) 2020 GoodData Corporation
import * as path from "path";
import { OptionalKind, VariableDeclarationKind, VariableStatementStructure } from "ts-morph";
import compact from "lodash/compact.js";
import { CatalogRecording } from "../recordings/catalog.js";

// const CatalogIndexConstName = "Catalog";

function catalogRecordingInit(rec: CatalogRecording, targetDir: string): string {
    const entries = Object.entries(rec.getEntryForRecordingIndex());

    const entryRows = entries
        .map(([type, file]) => `${type}: require('./${path.relative(targetDir, file)}')`)
        .join(",");

    return `{ ${entryRows} }`;
}

function generateRecordingConst(
    rec: CatalogRecording,
    targetDir: string,
): OptionalKind<VariableStatementStructure> {
    return {
        declarationKind: VariableDeclarationKind.Const,
        isExported: false,
        declarations: [
            {
                name: rec.getRecordingName(),
                initializer: catalogRecordingInit(rec, targetDir),
            },
        ],
    };
}

/**
 * Generate constants for catalog recording. This function will return non-exported constant per recording.
 *
 * @param recording - recording to generate constants for
 * @param targetDir - absolute path to directory where index will be stored, this is needed so that paths can be
 *   made relative for require()
 */
export function generateConstantsForCatalog(
    recording: CatalogRecording | null,
    targetDir: string,
): Array<OptionalKind<VariableStatementStructure>> {
    return compact([recording && generateRecordingConst(recording, targetDir)]);
}
