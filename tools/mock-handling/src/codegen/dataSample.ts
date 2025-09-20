// (C) 2020-2025 GoodData Corporation
import * as path from "path";

import { groupBy, has } from "lodash-es";

import { TakenNamesSet, createUniqueVariableName } from "../base/variableNaming.js";
import { DisplayFormRecording } from "../recordings/displayForms.js";

const DataSampleConstName = "DataSamples";

type DataSampleRecording = [string, DisplayFormRecording];

function createUniqueElementName(elementTitle: string, elementUri: string, scope: any): string {
    const sanitizedVariableName = createUniqueVariableName(elementTitle);
    if (has(scope, sanitizedVariableName)) {
        return `${sanitizedVariableName}_${createUniqueVariableName(elementUri)}`;
    }

    return createUniqueVariableName(elementTitle);
}

function compareUris(uri1?: string | null, uri2?: string | null): number {
    if (!uri1 || !uri2) {
        return uri1 ? 1 : uri2 ? -1 : 0;
    }

    return uri1.localeCompare(uri2);
}

function generateRecordingForDataSample(entries: DataSampleRecording[]): string {
    const scope: TakenNamesSet = {};
    const entryRows = entries
        .map(([_, entryRecording]) => {
            return entryRecording
                .getAttributeElements()
                .sort((a, b) => compareUris(a.uri, b.uri))
                .map((element, index) => {
                    const variableName = createUniqueElementName(
                        element.title ?? "NULL",
                        element.uri ?? "NULL",
                        scope,
                    );

                    scope[variableName] = true;
                    return `${variableName} : ${entryRecording.getRecordingName()}[${index}]`;
                });
        })
        .join(",");

    return `{ ${entryRows} }`;
}

function comparatorDataSample(a: [string, DataSampleRecording[]], b: [string, DataSampleRecording[]]) {
    if (a[0] < b[0]) {
        return -1;
    } else if (a[0] > b[0]) {
        return 1;
    }

    return 0;
}

export function generateDataSampleConst(recordings: DisplayFormRecording[]): string {
    const recsWithDataSample: DataSampleRecording[] = recordings.map((rec) => [
        createUniqueVariableName(rec.getDisplayFormTitle()),
        rec,
    ]);

    const entriesDataSample = Object.entries(groupBy(recsWithDataSample, ([title]) => title)).sort(
        comparatorDataSample,
    );
    const dataSampleRows = entriesDataSample
        .map(([title, rec]) => `${title}: ${generateRecordingForDataSample(rec)}`)
        .join(",");

    return `export const ${DataSampleConstName} = { ${dataSampleRows} }`;
}

/**
 * Generate constants for the display form recordings and data sample. This function will return non-exported constant per recording
 * and then also an exported 'DataSamples' constant that is a map from data sample ⇒ display form ⇒ recording.
 *
 * @param recordings - recordings to generate constants for
 * @param targetDir - absolute path to directory where index will be stored, this is needed so that paths can be
 *   made relative for require()
 */
export function generateImportsForDataSamples(
    recordings: DisplayFormRecording[],
    targetDir: string,
): string[] {
    return recordings.map(
        (rec) =>
            `import ${rec.getRecordingName()} from "./${path.relative(
                targetDir,
                rec.elementFile,
            )}" with { type: "json" };`,
    );
}
