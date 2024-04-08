// (C) 2021-2024 GoodData Corporation
import fs from "fs";

export function recordingsPresent() {
    const recordingsLength = fs.readdirSync(`./recordings/mappings/TIGER`).length;
    return recordingsLength !== 0;
}

export function getRecordingsWorkspaceId() {
    return "c76e0537d0614abb0027f7c992656b964922506f";
}
