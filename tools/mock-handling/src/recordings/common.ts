// (C) 2007-2019 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import fs = require("fs");
import pick = require("lodash/pick");

/**
 * A mapping of recording file type to file name. The file type is opaque - it is not handled in any way and
 * will be used as-is when constructing recording entry in the main recording index.
 */
export type RecordingIndexEntry = {
    [type: string]: string;
};

/**
 *
 */
export interface IRecording {
    /**
     * Directory where all assets for this recording are stored.
     */
    directory: string;

    /**
     * Tests whether the recording is complete == there is nothing more to capture from the backend.
     */
    isComplete(): boolean;

    /**
     * Obtains all assets for the recording.
     *
     * @param backend - analytical backend to use when making the recording
     * @param workspace - workspace to work with
     */
    makeRecording(backend: IAnalyticalBackend, workspace: string): Promise<void>;

    /**
     *
     */
    getRecordingName(): string;

    /**
     * Gets an entry that will represent this recording in the main recording index.
     */
    getEntryForRecordingIndex(): RecordingIndexEntry;
}

export function toJsonString(obj: any, keys?: string[]): string {
    if (keys) {
        return JSON.stringify(pick(obj, keys), null, 4);
    }

    return JSON.stringify(obj, null, 4);
}

export function writeAsJsonSync(file: string, obj: any, keys?: string[]) {
    return fs.writeFileSync(file, toJsonString(obj, keys), { encoding: "utf-8" });
}

export function writeAsJson(file: string, obj: any, keys?: string[]): Promise<void> {
    return fs.promises.writeFile(file, toJsonString(obj, keys), { encoding: "utf-8" });
}

export function readJsonSync(file: string): any {
    return JSON.parse(fs.readFileSync(file, { encoding: "utf-8" }));
}
