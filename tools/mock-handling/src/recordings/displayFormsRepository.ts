// (C) 2007-2020 GoodData Corporation
import flatMap from "lodash/flatMap.js";
import * as path from "path";
import { findFiles } from "../base/utils.js";
import { logWarn } from "../cli/loggers.js";
import { IRecording, isNonNullRecording, readJsonSync } from "./common.js";
import { DisplayFormRecording, DisplayFormsDefinition } from "./displayForms.js";

function createRecording(
    directory: string,
    displayForm: string,
    displayFormRecordingMeta: any,
): IRecording | null {
    try {
        return new DisplayFormRecording(directory, displayForm, displayFormRecordingMeta);
    } catch (e) {
        logWarn(
            `An error has occurred while loading display form recording from directory ${directory} and display form ${displayForm}: ${e} - the recording will not be included in further processing.`,
        );

        return null;
    }
}

function loadRecordings(recordingDefinition: string): IRecording[] {
    const directory = path.dirname(recordingDefinition);
    const requestedDisplayForms = readJsonSync(recordingDefinition);

    return Object.entries(requestedDisplayForms)
        .map(([displayForm, displayFormRecordingMeta]) =>
            createRecording(directory, displayForm, displayFormRecordingMeta),
        )
        .filter(isNonNullRecording);
}

export async function discoverDisplayFormRecordings(recordingDir: string): Promise<IRecording[]> {
    return flatMap(findFiles(recordingDir, DisplayFormsDefinition), loadRecordings);
}
