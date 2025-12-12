// (C) 2023-2025 GoodData Corporation

import { type IDateHierarchyTemplate } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";

export function loadDateHierarchyTemplates({
    backend,
    workspace,
}: DashboardContext): Promise<IDateHierarchyTemplate[]> {
    if (!backend.capabilities.supportsAttributeHierarchies) {
        return Promise.resolve([]);
    }

    return backend.workspace(workspace).attributeHierarchies().getDateHierarchyTemplates();
}
