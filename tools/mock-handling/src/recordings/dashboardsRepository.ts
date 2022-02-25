// (C) 2007-2022 GoodData Corporation
import flatMap from "lodash/flatMap";
import * as path from "path";
import { findFiles } from "../base/utils";
import { logWarn } from "../cli/loggers";
import { IRecording, isNonNullRecording, readJsonSync } from "./common";
import { DashboardsDefinition } from "./displayForms";
import { DashboardRecording, DashboardRecordingSpec, DashboardsEntryFile } from "./dashboards";

function createRecording(
    directory: string,
    dashboard: string,
    dashboardRecordingMeta: DashboardRecordingSpec,
): IRecording | null {
    try {
        return new DashboardRecording(directory, dashboard, dashboardRecordingMeta);
    } catch (e) {
        logWarn(
            `An error has occurred while loading dashboard recording from directory ${directory} and dashboard ${dashboard}: ${e} - the recording will not be included in further processing.`,
        );

        return null;
    }
}

function loadRecordings(recordingDefinition: string): IRecording[] {
    const directory = path.dirname(recordingDefinition);
    const requestedDashboards: DashboardsEntryFile = readJsonSync(recordingDefinition);

    return Object.entries(requestedDashboards)
        .map(([dashboard, dashboardRecordingMeta]) =>
            createRecording(directory, dashboard, dashboardRecordingMeta),
        )
        .filter(isNonNullRecording);
}

export async function discoverDashboardRecordings(recordingDir: string): Promise<IRecording[]> {
    return flatMap(findFiles(recordingDir, DashboardsDefinition), loadRecordings);
}
