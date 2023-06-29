// (C) 2022-2023 GoodData Corporation
import { areObjRefsEqual, idRef, ObjRef, uriRef } from "@gooddata/sdk-model";
import { DashboardContext } from "../../../../types/commonTypes.js";

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
    // try matching both uri and id in case the type of ref is different from what is in the ref field
    if (
        attributeDisplayForms.some(
            (df) =>
                areObjRefsEqual(idRef(df.id, "displayForm"), displayForm) ||
                areObjRefsEqual(uriRef(df.uri), displayForm),
        )
    ) {
        return "VALID";
    }

    return "INVALID_ATTRIBUTE_DISPLAY_FORM";
}
