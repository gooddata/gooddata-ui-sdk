// (C) 2020 GoodData Corporation
import json5 from "json5";
import fs from "fs";

/**
 * Reads json or json5 (rush uses this) from a file.
 *
 * @param file - file name
 */
export function readJsonSync(file: string): any {
    return json5.parse(fs.readFileSync(file, { encoding: "utf-8" }));
}
