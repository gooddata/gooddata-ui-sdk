// (C) 2007-2021 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import fs from "fs";
import pick from "lodash/pick.js";
import isEmpty from "lodash/isEmpty.js";
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
    Dashboards = "dashboards",
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
     * Whether this recordings should always be refreshed
     */
    alwaysRefresh(): boolean;

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
     * @param newWorkspaceId - workspace id to use in the captured data; if this is provided then all occurrences of
     *  `workspace` in the captured data must be replaced with `newWorkspaceId`
     */
    makeRecording(backend: IAnalyticalBackend, workspace: string, newWorkspaceId?: string): Promise<void>;

    /**
     * Gets an entry that will represent this recording in the main recording index.
     */
    getEntryForRecordingIndex(): RecordingIndexEntry;
}

//
//
//

export function toJsonString(obj: object, options: WriteJsonOptions = {}): string {
    const { pickKeys, replaceString } = options;
    let result: string;

    if (pickKeys) {
        result = stringify(pick(obj, pickKeys));
    } else {
        result = stringify(obj);
    }

    if (replaceString) {
        result = result.replace(new RegExp(replaceString[0], "g"), replaceString[1]);
    }

    return result;
}

export type WriteJsonOptions = {
    pickKeys?: string[];
    replaceString?: [string, string];
};

export function writeAsJsonSync(file: string, obj: object, options?: WriteJsonOptions): void {
    fs.writeFileSync(file, toJsonString(obj, options), { encoding: "utf-8" });
}

export function readJsonSync(file: string): any {
    return JSON.parse(fs.readFileSync(file, { encoding: "utf-8" }));
}

export function isNonNullRecording(rec: any | null): rec is IRecording {
    return !isEmpty(rec) && (rec as IRecording).directory !== undefined;
}
