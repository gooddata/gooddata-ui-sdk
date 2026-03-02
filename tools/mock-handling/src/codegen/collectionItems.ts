// (C) 2007-2026 GoodData Corporation

import * as path from "path";

import { type CollectionItemsRecording } from "../recordings/collectionItems.js";

/**
 * Generate constants for collection items recordings. This returns one constant per recording that
 * points directly to the recorded result.
 *
 * @param recordings - recordings to generate constants for
 * @param targetDir - absolute path to directory where index will be stored, this is needed so that paths can be
 *   made relative for require()
 */
export function generateConstantsForCollectionItems(
    recordings: CollectionItemsRecording[],
    targetDir: string,
): string[] {
    const statements: string[] = [];

    recordings.forEach((recording) => {
        const entries = Object.entries(recording.getEntryForRecordingIndex());
        const recordingName = recording.getRecordingName();

        entries.forEach(([type, file]) => {
            const importName = `${recordingName}_${type}`;
            statements.push(
                `import ${importName} from "./${path.relative(targetDir, file)}" with { type: "json" };`,
            );
            statements.push(`const ${recordingName} = ${importName};`);
        });
    });

    return statements;
}
