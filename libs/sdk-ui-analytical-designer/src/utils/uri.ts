// (C) 2021-2026 GoodData Corporation

export function getWorkspaceRef(isRenamingProjectToWorkspaceEnabled: boolean, isInPlural = true): string {
    if (isRenamingProjectToWorkspaceEnabled) {
        return isInPlural ? "workspaces" : "workspace";
    }
    return isInPlural ? "projects" : "project";
}
