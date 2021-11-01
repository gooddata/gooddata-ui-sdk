// (C) 2021 GoodData Corporation
import * as fs from "fs";

export function toJsonString(obj: any): string {
    // note: using json-stable-stringify is likely not a good idea in this project:
    // the toolkit works with package.json files; stable stringify will reshuffle contents of package.json
    return JSON.stringify(obj, null, 4);
}

export function writeAsJsonSync(file: string, obj: object): void {
    fs.writeFileSync(file, toJsonString(obj), { encoding: "utf-8" });
}

export function readJsonSync(file: string): any {
    return JSON.parse(fs.readFileSync(file, { encoding: "utf-8" }));
}
