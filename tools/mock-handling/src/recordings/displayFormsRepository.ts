// (C) 2007-2019 GoodData Corporation
import { flatMap } from "lodash";
import * as fs from "fs";
import * as path from "path";
import { logInfo, logWarn } from "../cli/loggers";
import { DisplayFormsDefinition, DisplayFormRecording } from "./displayForms";
import { IRecording, readJsonSync } from "./common";

export const DisplayFormsDir = "metadata";

function locateDefinitions(dfDir: string): string[] {
    const entries = fs.readdirSync(dfDir, { withFileTypes: true, encoding: "utf-8" });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dfDir, entry.name);

        if (entry.isDirectory()) {
            files.push(...locateDefinitions(fullPath));
        } else if (entry.isFile() && entry.name === DisplayFormsDefinition) {
            files.push(fullPath);
        }
    }

    return files;
}

function createRecording(
    directory: string,
    displayForm: string,
    displayFormRequest: any,
): DisplayFormRecording | null {
    try {
        return new DisplayFormRecording(directory, displayForm, displayFormRequest);
    } catch (e) {
        logWarn(
            `An error has occurred while loading display form recording from directory ${directory} and display form ${displayForm}: ${e} - the recording will not be included in further processing.`,
        );

        return null;
    }
}

function isNonNullRecording(obj: any): obj is DisplayFormRecording {
    return obj !== null;
}

function loadRecordings(recordingDefinition: string): DisplayFormRecording[] {
    const directory = path.dirname(recordingDefinition);
    const requestedDisplayForms = readJsonSync(recordingDefinition);

    return Object.entries(requestedDisplayForms)
        .map(([displayForm, displayFormRequest]) =>
            createRecording(directory, displayForm, displayFormRequest),
        )
        .filter(isNonNullRecording);
}

export async function discoverDisplayFormRecordings(recordingDir: string): Promise<IRecording[]> {
    const displayFormDir = path.join(recordingDir, DisplayFormsDir);

    if (!fs.existsSync(displayFormDir)) {
        logInfo(
            `Recordings directory contains no '${DisplayFormsDir}' subdir - assuming no display forms to record`,
        );

        return [];
    } else if (!fs.statSync(displayFormDir).isDirectory()) {
        logWarn(
            `Recordings directory contains '${DisplayFormsDir}' but it is not a directory - this is likely a problem in your recordings organization. No display form recordings will be captured.`,
        );

        return [];
    }

    return flatMap(await locateDefinitions(displayFormDir), loadRecordings);
}
