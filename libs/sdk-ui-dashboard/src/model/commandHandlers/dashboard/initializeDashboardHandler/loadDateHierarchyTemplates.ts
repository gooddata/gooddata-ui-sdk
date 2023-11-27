// (C) 2023 GoodData Corporation

import { DashboardContext } from "../../../types/commonTypes.js";
import { IDateHierarchyTemplate } from "@gooddata/sdk-model";

export function loadDateHierarchyTemplates(ctx: DashboardContext): Promise<IDateHierarchyTemplate[]> {
    const { backend, workspace } = ctx;

    if (!backend.capabilities.supportsAttributeHierarchies) {
        return Promise.resolve([]);
    }

    return backend.workspace(workspace).attributeHierarchies().getDateHierarchyTemplates();
}
