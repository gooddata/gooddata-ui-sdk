// (C) 2007-2025 GoodData Corporation
import fs from "fs";
import stringify from "json-stable-stringify";

function toJsonString(obj: any): string {
    return stringify(obj);
}

export async function writeAsJsonSync(file: string, obj: any) {
    fs.writeFileSync(file, toJsonString(obj), { encoding: "utf-8" });
    // it seems that fs has an issue where it claims to have finished before it actually has on Mac, this timeout fixes that
    await new Promise((resolve) => setTimeout(resolve, 0));
}

export function readJsonSync(file: string): any {
    return JSON.parse(fs.readFileSync(file, { encoding: "utf-8" }));
}
