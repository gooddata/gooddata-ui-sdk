// (C) 2021-2026 GoodData Corporation
import { type ObjRef } from "@gooddata/sdk-model";

import {
    loadComputedAttributesByRefs,
    partitionComputedAttributeRefs,
} from "../../../../_staging/catalog/computedAttributes.js";
import { type DashboardContext } from "../../../types/commonTypes.js";

export async function loadAvailableDisplayFormRefs(
    ctx: DashboardContext,
    displayForms: ObjRef[],
): Promise<ObjRef[]> {
    const { backend, workspace } = ctx;

    // computed-attribute-typed display form refs never match labels; they are available exactly
    // when the computed attribute itself resolves through the computedAttributes service
    const { computedAttributeRefs, otherRefs } = partitionComputedAttributeRefs(displayForms);

    const [computedAttributes, labels] = await Promise.all([
        loadComputedAttributesByRefs(backend, workspace, computedAttributeRefs),
        otherRefs.length
            ? backend.workspace(workspace).attributes().getAttributeDisplayForms(otherRefs)
            : Promise.resolve([]),
    ]);

    return [
        ...labels.map((df) => df.ref),
        ...computedAttributes.flatMap((ca) => ca.displayForms.map((df) => df.ref)),
    ];
}
