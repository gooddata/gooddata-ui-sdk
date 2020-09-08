// (C) 2007-2020 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import fs = require("fs");
import pick = require("lodash/pick");
import isEmpty = require("lodash/isEmpty");
import stringify from "json-stable-stringify";

/**
 * A mapping of recording file type to file name. The file type is opaque - it is not handled in any way and
 * will be used as-is when constructing recording entry in the main recording index.
 */
export type RecordingIndexEntry = {
    [type: string]: string;
};

export enum RecordingType {
    Execution = "execution",
    DisplayForms = "displayForms",
    Insights = "insights",
    Catalog = "catalog",
    VisClasses = "visClasses",
}

/**
 * Recording of any type implements this interface.
 */
export interface IRecording {
    /**
     * Directory where all assets for this recording are stored.
     */
    directory: string;

    /**
     * Returns type of this recording.
     */
    getRecordingType(): RecordingType;

    /**
     * Returns unique name of this recording
     */
    getRecordingName(): string;

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
     * Gets an entry that will represent this recording in the main recording index.
     */
    getEntryForRecordingIndex(): RecordingIndexEntry;
}

//
//
//

export function toJsonString(obj: object, keys?: string[]): string {
    if (keys) {
        return stringify(pick(obj, keys));
    }

    return stringify(obj);
}

export function writeAsJsonSync(file: string, obj: object, keys?: string[]): void {
    fs.writeFileSync(file, toJsonString(obj, keys), { encoding: "utf-8" });
}

export function readJsonSync(file: string): any {
    return JSON.parse(fs.readFileSync(file, { encoding: "utf-8" }));
}

export function isNonNullRecording(rec: any | null): rec is IRecording {
    return !isEmpty(rec) && (rec as IRecording).directory !== undefined;
}
