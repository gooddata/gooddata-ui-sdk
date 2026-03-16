// (C) 2021-2026 GoodData Corporation

import recordings from "../../recordings_workspace.json" with { type: "json" };

export function getRecordingsWorkspaceId() {
    return recordings.workspaceId;
}
