// (C) 2021-2023 GoodData Corporation
import fs from "fs";

export function ensureRecordingsDirectory(backend) {
    fs.mkdirSync(`./recordings/mappings/${backend}`, { recursive: true });
}

export function recordingsPresent(backend) {
    const recordingsLength = fs.readdirSync(`./recordings/mappings/${backend}`).length;
    return recordingsLength !== 0;
}

export function getRecordingsWorkspaceId() {
    return "c76e0537d0614abb0027f7c992656b964922506f";
}
