// (C) 2022-2026 GoodData Corporation

import { type ObjRef, areObjRefsEqual, isComputedAttributeRef } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../../types/commonTypes.js";
import { isDisplayFormMetadataReferencedBy } from "../../../../utils/attributeFilterMatching.js";

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

    // A computed attribute has exactly one fabricated display form that shares the computed
    // attribute's own ref, so the validation needs no backend roundtrip - and the attributes
    // service could not resolve such a ref anyway.
    if (isComputedAttributeRef(filterAttribute)) {
        return areObjRefsEqual(filterAttribute, displayForm) ? "VALID" : "INVALID_ATTRIBUTE_DISPLAY_FORM";
    }

    const attributeDisplayForms = (
        await backend.workspace(workspace).attributes().getAttribute(filterAttribute)
    ).displayForms;

    // validate if the display form is between attributes available display forms.
    // try matching both uri and id in case the type of ref is different from what is in the ref field
    if (attributeDisplayForms.some((df) => isDisplayFormMetadataReferencedBy(df, displayForm))) {
        return "VALID";
    }

    return "INVALID_ATTRIBUTE_DISPLAY_FORM";
}
