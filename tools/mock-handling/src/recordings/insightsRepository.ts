// (C) 2007-2020 GoodData Corporation
import { flatMap } from "lodash";
import * as path from "path";
import { findFiles } from "../base/utils";
import { logWarn } from "../cli/loggers";
import { IRecording, isNonNullRecording, readJsonSync } from "./common";
import { InsightRecording } from "./insights";
import { RecordingFiles } from "../interface";

function createRecording(directory: string, insightId: string, insightRecordingSpec: any): IRecording | null {
    try {
        return new InsightRecording(directory, insightId, insightRecordingSpec);
    } catch (e) {
        logWarn(
            `An error has occurred while loading insight recording from directory ${directory} and insight ${insightId}: ${e} - the recording will not be included in further processing.`,
        );

        return null;
    }
}

function loadRecordings(recordingDefinition: string): IRecording[] {
    const directory = path.dirname(recordingDefinition);
    const requestedInsights = readJsonSync(recordingDefinition);

    return Object.entries(requestedInsights)
        .map(([insightId, insightRecordingSpec]) =>
            createRecording(directory, insightId, insightRecordingSpec),
        )
        .filter(isNonNullRecording);
}

export async function discoverInsightRecordings(recordingDir: string): Promise<IRecording[]> {
    return flatMap(findFiles(recordingDir, RecordingFiles.Insights.Index), loadRecordings);
}
