// (C) 2021-2026 GoodData Corporation

import fs from "fs";

import recordings from "@gooddata/sdk-ui-tests-reference-workspace/recordings_workspace" with { type: "json" };

export function recordingsPresent() {
    const recordingsLength = fs.readdirSync(`./recordings/mappings/TIGER`).length;
    return recordingsLength !== 0;
}

export function getRecordingsWorkspaceId() {
    return recordings.workspaceId;
}
