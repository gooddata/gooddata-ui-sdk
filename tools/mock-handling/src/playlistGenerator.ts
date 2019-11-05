// (C) 2019 GoodData Corporation

import * as fs from "fs";
import * as path from "path";
import { defFingerprint, IExecutionDefinition } from "@gooddata/sdk-model";
import union from "lodash/union";

const _COPYRIGHT = `// (C) 2019-${new Date().getFullYear()} GoodData Corporation`;
const _WARNING = `// THIS FILE WAS AUTO-GENERATED ON ${new Date().toISOString()}; DO NOT EDIT; LOOK INTO 'mock-handling' TOOLING`;
const _TSLINT = "// tslint:disable:variable-name";

const EXECUTION_FOLDER = "execution";

const METADATA_FOLDER = "metadata";
const ATTRIBUTE_DISPLAY_FORM_FOLDER = "attributeDisplayForm";

const ELEMENTS_FOLDER = "elements";

type ExecutionRecordingEntry = {
    name: string;
    def: IExecutionDefinition;
    constant: string;
};

function makeNameNice(dirName: string): string {
    return dirName
        .split("_")
        .map(word => word.charAt(0).toLocaleUpperCase() + word.substr(1))
        .join("");
}

function executionRecordingEntry(dirName: string, dir: string): ExecutionRecordingEntry | null {
    const defPath = path.join(dir, "definition.json");
    const responsePath = path.join(dir, "response.json");
    const resultPath = path.join(dir, "result.json");

    if (!fs.existsSync(defPath) || !fs.existsSync(responsePath) || !fs.existsSync(resultPath)) {
        console.log("WARN: Directory", dir, "does not contain all the required files. Skipping...");

        return null;
    }

    console.log("INFO: Building playlist entry for", dirName, "reading definition...");

    const name = makeNameNice(dirName);
    const def = JSON.parse(fs.readFileSync(defPath, { encoding: "utf-8" })) as IExecutionDefinition;
    const constant = `export const ${name} = {
    definition: require('./${EXECUTION_FOLDER}/${dirName}/definition.json'),
    response: require('./${EXECUTION_FOLDER}/${dirName}/response.json'),
    result: require('./${EXECUTION_FOLDER}/${dirName}/result.json'),
};
    `;

    return {
        name,
        def,
        constant,
    };
}

function isExecutionRecording(obj: any): obj is ExecutionRecordingEntry {
    return obj !== null;
}

function getMetadataEntries(dir: string) {
    const metadataWorkspaces = fs
        .readdirSync(path.join(dir, METADATA_FOLDER), { withFileTypes: true })
        .filter(maybeDir => maybeDir.isDirectory());

    const attributeDisplayFormEntries = metadataWorkspaces.reduce(
        (acc, workspace) => {
            // console.log("INFO: Found possible attribute display form playlist entry: ", workspace.name);

            acc[workspace.name] = fs
                .readdirSync(
                    path.resolve(dir, METADATA_FOLDER, workspace.name, ATTRIBUTE_DISPLAY_FORM_FOLDER),
                )
                .reduce(
                    (workspaceDisplayForms, definition) => {
                        const sanitizedName = path.parse(definition).name.replace(/\./g, "_");
                        workspaceDisplayForms[
                            sanitizedName
                        ] = `require('./${METADATA_FOLDER}/${workspace.name}/${ATTRIBUTE_DISPLAY_FORM_FOLDER}/${definition}')`;
                        return workspaceDisplayForms;
                    },
                    {} as any,
                );

            return acc;
        },
        {} as any,
    );

    const attributeDisplayFormWorkspaces = Object.keys(attributeDisplayFormEntries);

    const workspaces = union(attributeDisplayFormWorkspaces /* TODO others */);

    return workspaces.reduce(
        (acc, workspace) => {
            acc[workspace] = {};
            if (attributeDisplayFormEntries[workspace]) {
                acc[workspace].attributeDisplayForm = attributeDisplayFormEntries[workspace];
            }
            return acc;
        },
        {} as any,
    );
}

function getElementsEntries(dir: string) {
    const elementsWorkspaces = fs
        .readdirSync(path.join(dir, ELEMENTS_FOLDER), { withFileTypes: true })
        .filter(maybeDir => maybeDir.isDirectory());

    return elementsWorkspaces.reduce(
        (acc, workspace) => {
            acc[workspace.name] = fs.readdirSync(path.resolve(dir, ELEMENTS_FOLDER, workspace.name)).reduce(
                (workspaceElements, objectId) => {
                    const sanitizedName = path.parse(objectId).name.replace(/\./g, "_");
                    workspaceElements[
                        sanitizedName
                    ] = `require('./${ELEMENTS_FOLDER}/${workspace.name}/${objectId}')`;
                    return workspaceElements;
                },
                {} as any,
            );
            return acc;
        },
        {} as any,
    );
}

function main(dir: string) {
    if (!fs.existsSync(dir)) {
        console.log(path.resolve(dir));

        console.log(`ERROR: Recordings directory ${dir} does not exist`);
    }

    const executionRecordingEntries = fs
        .readdirSync(path.join(dir, EXECUTION_FOLDER), { withFileTypes: true })
        .map(maybeDir => {
            if (!maybeDir.isDirectory()) {
                return null;
            }

            console.log("INFO: Found possible playlist entry: ", maybeDir.name);

            return executionRecordingEntry(maybeDir.name, path.join(dir, EXECUTION_FOLDER, maybeDir.name));
        })
        .filter(isExecutionRecording);

    if (!executionRecordingEntries.length) {
        console.log("WARN: No recordings found. Doing nothing");

        return;
    }
    const playlist = path.join(dir, "playlist.ts");

    const executionRecordingsMap = executionRecordingEntries.reduce(
        (acc: any, entry: ExecutionRecordingEntry) => {
            const {
                def,
                def: { workspace },
            } = entry;
            let workspaceDir = acc[workspace];

            if (!workspaceDir) {
                acc[workspace] = {};
                workspaceDir = acc[workspace];
            }

            workspaceDir["fp_" + defFingerprint(def)] = entry.name;

            return acc;
        },
        {},
    );

    const metadataRecordingsMap: any = getMetadataEntries(dir);
    const elementsRecordingsMap: any = getElementsEntries(dir);

    const executionWorkspaces = Object.keys(executionRecordingsMap);
    const metadataWorkspaces = Object.keys(metadataRecordingsMap);
    const elementsWorkspaces = Object.keys(elementsRecordingsMap);

    const workspaces = union(executionWorkspaces, metadataWorkspaces, elementsWorkspaces);

    const workspaceContentsMap = workspaces.reduce((acc: any, workspace) => {
        acc[workspace] = {};
        if (executionRecordingsMap[workspace]) {
            acc[workspace].execution = executionRecordingsMap[workspace];
        }
        if (metadataRecordingsMap[workspace]) {
            acc[workspace].metadata = metadataRecordingsMap[workspace];
        }
        if (elementsRecordingsMap[workspace]) {
            acc[workspace].elements = elementsRecordingsMap[workspace];
        }
        return acc;
    }, {});

    const constants = executionRecordingEntries.map(entry => entry.constant).join("\n");
    const masterIndex = `// initialize recorded backend with this\nexport const MasterIndex = ${JSON.stringify(
        workspaceContentsMap,
        null,
        4,
    ).replace(/"/g, "")};`;

    fs.writeFileSync(playlist, `${_COPYRIGHT}\n${_WARNING}\n${_TSLINT}\n${constants}\n${masterIndex}`, {
        encoding: "utf-8",
    });

    console.log("SUCCESS: Created", playlist);
}

const DIR = "../../libs/sdk-ui/__mocks__/recordings/";

/**
 * Given a directory, this program will pounce around, look for all subdirectories that contain the definition, response
 * and result triplet. If there are any such dirs, the program will generate a playlist.ts in the given directory.
 *
 * This playlist will contain exported constants; const variable is same as directory name (so mind the naming) and
 * the const value is object with three keys: definition, response and request. For each key, there is a require()
 * for the recording data JSON.
 */

main(DIR);
