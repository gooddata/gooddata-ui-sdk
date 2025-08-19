// (C) 2020-2025 GoodData Corporation
import * as path from "path";

import { VisClassesRecording } from "../recordings/visClasses.js";

/**
 * Generate constants for visClasses recording. This function will return non-exported constant per recording.
 *
 * @param recording - recording to generate constants for
 * @param targetDir - absolute path to directory where index will be stored, this is needed so that paths can be
 *   made relative for require()
 */
export function generateConstantsForVisClasses(recording: VisClassesRecording, targetDir: string): string[] {
    const entries = Object.entries(recording.getEntryForRecordingIndex());

    const recordingName = recording.getRecordingName();

    const entryRows = entries.map(([type, _]) => `${type}: ${recordingName}_${type}`).join(",");

    return [
        ...entries.map(
            ([type, file]) =>
                `import ${recordingName}_${type} from "./${path.relative(targetDir, file)}" with { type: "json" };`,
        ),
        `const ${recordingName} = { ${entryRows} };`,
    ];
}
