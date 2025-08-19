// (C) 2020-2025 GoodData Corporation
import fs from "fs";

import json5 from "json5";

/**
 * Reads json or json5 (rush uses this) from a file.
 *
 * @param file - file name
 */
export function readJsonSync(file: string): any {
    return json5.parse(fs.readFileSync(file, { encoding: "utf-8" }));
}
