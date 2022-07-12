// (C) 2022 GoodData Corporation

import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import { DashboardContext } from "../../../../types/commonTypes";

export type AttributeFilterDisplayFormValidationResult =
    | "VALID"
    | "INVALID_FILTER_ATTRIBUTE"
    | "INVALID_ATTRIBUTE_DISPLAY_FORM";

export async function validateFilterDisplayForm(
    ctx: DashboardContext,
    filterAttribute: ObjRef | undefined,
    displayForm: ObjRef,
): Promise<AttributeFilterDisplayFormValidationResult> {
    // validate if the filter attribute is available
    if (!filterAttribute) {
        return "INVALID_FILTER_ATTRIBUTE";
    }

    const { backend, workspace } = ctx;

    const attributeDisplayForms = (
        await backend.workspace(workspace).attributes().getAttribute(filterAttribute)
    ).displayForms;

    // validate if the display form is between attributes available display forms.
    if (attributeDisplayForms.some((df) => areObjRefsEqual(df.ref, displayForm))) {
        return "VALID";
    }

    return "INVALID_ATTRIBUTE_DISPLAY_FORM";
}
