// (C) 2007-2022 GoodData Corporation
import flatMap from "lodash/flatMap";
import * as path from "path";
import { findFiles } from "../base/utils";
import { logWarn } from "../cli/loggers";
import { IRecording, isNonNullRecording, readJsonSync } from "./common";
import {
    DisplayFormRecording,
    DisplayFormRecordingSpec,
    DisplayFormsDefinition,
    DisplayFormsEntryFile,
} from "./displayForms";

function createRecording(
    directory: string,
    displayForm: string,
    displayFormRecordingMetas: DisplayFormRecordingSpec[],
): IRecording | null {
    try {
        return new DisplayFormRecording(directory, displayForm, displayFormRecordingMetas);
    } catch (e) {
        logWarn(
            `An error has occurred while loading display form recording from directory ${directory} and display form ${displayForm}: ${e} - the recording will not be included in further processing.`,
        );

        return null;
    }
}

function loadRecordings(recordingDefinition: string): IRecording[] {
    const directory = path.dirname(recordingDefinition);
    const requestedDisplayForms: DisplayFormsEntryFile = readJsonSync(recordingDefinition);

    return Object.entries(requestedDisplayForms)
        .map(([displayForm, displayFormRecordingMetas]) =>
            createRecording(directory, displayForm, displayFormRecordingMetas),
        )
        .filter(isNonNullRecording);
}

export async function discoverDisplayFormRecordings(recordingDir: string): Promise<IRecording[]> {
    return flatMap(findFiles(recordingDir, DisplayFormsDefinition), loadRecordings);
}
