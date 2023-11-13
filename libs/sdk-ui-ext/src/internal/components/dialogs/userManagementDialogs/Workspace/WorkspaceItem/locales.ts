// (C) 2023 GoodData Corporation

import { defineMessages } from "react-intl";

export const hierarchicalPermissionMessages = defineMessages({
    enabled: { id: "userManagement.workspace.hierarchicalPermission.yes" },
    disabled: { id: "userManagement.workspace.hierarchicalPermission.no" },
});

export const workspacePermissionMessages = defineMessages({
    VIEW: { id: "userManagement.workspace.permission.view" },
    VIEW_AND_EXPORT: { id: "userManagement.workspace.permission.viewExport" },
    ANALYZE: { id: "userManagement.workspace.permission.analyze" },
    ANALYZE_AND_EXPORT: { id: "userManagement.workspace.permission.analyzeExport" },
    MANAGE: { id: "userManagement.workspace.permission.manage" },
    remove: { id: "userManagement.workspace.permission.remove" },
});
