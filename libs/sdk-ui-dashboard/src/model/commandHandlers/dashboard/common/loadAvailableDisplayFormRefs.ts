// (C) 2021-2022 GoodData Corporation
import { DashboardContext } from "../../../types/commonTypes.js";
import { ObjRef } from "@gooddata/sdk-model";

export function loadAvailableDisplayFormRefs(
    ctx: DashboardContext,
    displayForms: ObjRef[],
): Promise<ObjRef[]> {
    const { backend, workspace } = ctx;

    return backend
        .workspace(workspace)
        .attributes()
        .getAttributeDisplayForms(displayForms)
        .then((references) => references.map((df) => df.ref));
}
