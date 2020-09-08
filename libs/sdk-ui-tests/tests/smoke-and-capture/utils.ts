// (C) 2007-2020 GoodData Corporation
import fs from "fs";
import stringify from "json-stable-stringify";

function toJsonString(obj: any): string {
    return stringify(obj);
}

export function writeAsJsonSync(file: string, obj: any) {
    return fs.writeFileSync(file, toJsonString(obj), { encoding: "utf-8" });
}

export function readJsonSync(file: string): any {
    return JSON.parse(fs.readFileSync(file, { encoding: "utf-8" }));
}
