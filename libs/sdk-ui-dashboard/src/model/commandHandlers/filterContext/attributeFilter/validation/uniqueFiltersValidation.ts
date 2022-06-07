// (C) 2021-2022 GoodData Corporation
import { areObjRefsEqual, ObjRef, IDashboardAttributeFilter } from "@gooddata/sdk-model";
import { DashboardContext } from "../../../../types/commonTypes";

export async function canFilterBeAdded(
    ctx: DashboardContext,
    addedDisplayFormRef: ObjRef,
    allFilters: IDashboardAttributeFilter[],
): Promise<boolean> {
    // first filter is always ok, save some useless work upfront
    if (allFilters.length === 0) {
        return true;
    }

    const loadAddedDisplayForm = ctx.backend
        .workspace(ctx.workspace)
        .attributes()
        .getAttributeDisplayForm(addedDisplayFormRef);

    const loadExistingDisplayForms = ctx.backend
        .workspace(ctx.workspace)
        .attributes()
        .getAttributeDisplayForms(allFilters.map((item) => item.attributeFilter.displayForm));

    const [addedDisplayForm, existingDisplayForms] = await Promise.all([
        loadAddedDisplayForm,
        loadExistingDisplayForms,
    ]);

    return !existingDisplayForms.some((existing) => areObjRefsEqual(existing, addedDisplayForm));
}
