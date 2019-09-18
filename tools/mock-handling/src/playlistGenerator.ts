// (C) 2019 GoodData Corporation

import * as fs from "fs";
import * as path from "path";

const _COPYRIGHT = `// (C) 2019-${new Date().getFullYear()} GoodData Corporation`;
const _WARNING = `// THIS FILE WAS AUTO-GENERATED ON ${new Date().toISOString()}; DO NOT EDIT; LOOK INTO 'mock-handling' TOOLING`;
const _TSLINT = "// tslint:disable:variable-name";

function recordingEntry(name: string, dir: string): string | null {
    const def = path.join(dir, "definition.json");
    const response = path.join(dir, "response.json");
    const result = path.join(dir, "result.json");

    if (!fs.existsSync(def) || !fs.existsSync(response) || !fs.existsSync(result)) {
        console.log("WARN: Directory", dir, "does not contain all the required files. Skipping...");

        return null;
    }

    console.log("INFO: Building playlist entry for", name);

    return `export const ${name} = {
    definition: require('./${name}/definition.json'),
    response: require('./${name}/response.json'),
    result: require('./${name}/result.json'),
};
    `;
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
        .filter(item => item !== null);

    if (!entries.length) {
        console.log("WARN: No recordings found. Doing nothing");
    } else {
        const playlist = path.join(dir, "playlist.ts");
        fs.writeFileSync(playlist, `${_COPYRIGHT}\n${_WARNING}\n${_TSLINT}\n${entries.join("\n")}`, {
            encoding: "utf-8",
        });

        console.log("SUCCESS: Created", playlist);
    }
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
