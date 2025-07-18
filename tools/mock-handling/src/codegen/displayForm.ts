// (C) 2007-2025 GoodData Corporation

import * as path from "path";
import { DisplayFormRecording } from "../recordings/displayForms.js";

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
): string[] {
    return recordings
        .map((r) => {
            const entries = Object.entries(r.getEntryForRecordingIndex());

            const recordingName = r.getRecordingName();

            const entryRows = entries.map(([type, _]) => `${type}: ${recordingName}_${type}`).join(",");

            return [
                ...entries.map(
                    ([type, file]) =>
                        `import ${recordingName}_${type} from "./${path.relative(targetDir, file)}" with { type: "json" };`,
                ),
                `const ${recordingName} = { ${entryRows} }`,
            ];
        })
        .reduce((acc, curr) => acc.concat(curr), []);
}
