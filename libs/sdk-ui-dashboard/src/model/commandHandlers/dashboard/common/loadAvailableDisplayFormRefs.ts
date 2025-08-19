// (C) 2021-2025 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";

import { DashboardContext } from "../../../types/commonTypes.js";

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
