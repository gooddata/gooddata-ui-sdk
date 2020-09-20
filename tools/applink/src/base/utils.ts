// (C) 2020 GoodData Corporation
import json5 from "json5";
import fs from "fs";

export function readJsonSync(file: string): any {
    return json5.parse(fs.readFileSync(file, { encoding: "utf-8" }));
}
