// (C) 2019 GoodData Corporation

import * as fs from "fs";
import * as path from "path";
import { defFingerprint, IExecutionDefinition } from "@gooddata/sdk-backend-spi";

const _COPYRIGHT = `// (C) 2019-${new Date().getFullYear()} GoodData Corporation`;
const _WARNING = `// THIS FILE WAS AUTO-GENERATED ON ${new Date().toISOString()}; DO NOT EDIT; LOOK INTO 'mock-handling' TOOLING`;
const _TSLINT = "// tslint:disable:variable-name";

type RecordingEntry = {
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

function recordingEntry(dirName: string, dir: string): RecordingEntry | null {
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
    definition: require('./${dirName}/definition.json'),
    response: require('./${dirName}/response.json'),
    result: require('./${dirName}/result.json'),
};
    `;

    return {
        name,
        def,
        constant,
    };
}

function isRecording(obj: any): obj is RecordingEntry {
    return obj !== null;
}

function main(dir: string) {
    if (!fs.existsSync(dir)) {
        console.log(`ERROR: Recordings directory ${dir} does not exist`);
    }

    const entries = fs
        .readdirSync(dir, { withFileTypes: true })
        .map(maybeDir => {
            if (!maybeDir.isDirectory()) {
                return null;
            }

            console.log("INFO: Found possible playlist entry: ", maybeDir.name);

            return recordingEntry(maybeDir.name, path.join(dir, maybeDir.name));
        })
        .filter(isRecording);

    if (!entries.length) {
        console.log("WARN: No recordings found. Doing nothing");

        return;
    }
    const playlist = path.join(dir, "playlist.ts");

    const recordingsMap = entries.reduce((acc: any, entry: RecordingEntry) => {
        const {
            def,
            def: { workspace },
        } = entry;
        let workspaceDir = acc[workspace];

        if (!workspaceDir) {
            acc[workspace] = {};
            workspaceDir = acc[workspace];
        }

        workspaceDir[defFingerprint(def)] = entry.name;

        return acc;
    }, {});

    const constants = entries.map(entry => entry.constant).join("\n");
    const masterIndex = `// initialize recorded backend with this\nexport const MasterIndex = ${JSON.stringify(
        recordingsMap,
        null,
        4,
    ).replace(/"/g, "")};`;

    fs.writeFileSync(playlist, `${_COPYRIGHT}\n${_WARNING}\n${_TSLINT}\n${constants}\n${masterIndex}`, {
        encoding: "utf-8",
    });

    console.log("SUCCESS: Created", playlist);
}

const DIR = "../../../libs/sdk-ui/__mocks__/recordings/";

/**
 * Given a directory, this program will pounce around, look for all subdirectories that contain the definition, response
 * and result triplet. If there are any such dirs, the program will generate a playlist.ts in the given directory.
 *
 * This playlist will contain exported constants; const variable is same as directory name (so mind the naming) and
 * the const value is object with three keys: definition, response and request. For each key, there is a require()
 * for the recording data JSON.
 */

main(DIR);
