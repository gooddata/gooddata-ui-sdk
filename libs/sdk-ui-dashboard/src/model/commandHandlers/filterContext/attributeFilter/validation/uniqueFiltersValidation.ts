// (C) 2021-2026 GoodData Corporation

import {
    type DashboardAttributeFilterItem,
    type ObjRef,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    isComputedAttributeRef,
} from "@gooddata/sdk-model";

import { partitionComputedAttributeRefs } from "../../../../../_staging/catalog/computedAttributes.js";
import { type DashboardContext } from "../../../../types/commonTypes.js";

export async function canFilterBeAdded(
    ctx: DashboardContext,
    addedDisplayFormRef: ObjRef,
    allFilters: DashboardAttributeFilterItem[],
): Promise<boolean> {
    // first filter is always ok, save some useless work upfront
    if (allFilters.length === 0) {
        return true;
    }

    // A computed attribute's fabricated display form shares the computed attribute's own ref, so
    // its attribute ref is known without a backend roundtrip - and the labels service would not
    // find such a display form anyway.
    const loadAddedAttributeRef = isComputedAttributeRef(addedDisplayFormRef)
        ? Promise.resolve(addedDisplayFormRef)
        : ctx.backend
              .workspace(ctx.workspace)
              .attributes()
              .getAttributeDisplayForm(addedDisplayFormRef)
              .then((df) => df.attribute);

    const { computedAttributeRefs, otherRefs } = partitionComputedAttributeRefs(
        allFilters.map((item) => dashboardAttributeFilterItemDisplayForm(item)!),
    );

    const loadExistingAttributeRefs = otherRefs.length
        ? ctx.backend
              .workspace(ctx.workspace)
              .attributes()
              .getAttributeDisplayForms(otherRefs)
              .then((dfs) => dfs.map((df) => df.attribute))
        : Promise.resolve<ObjRef[]>([]);

    const [attributeFilterRef, existingOtherAttributeRefs] = await Promise.all([
        loadAddedAttributeRef,
        loadExistingAttributeRefs,
    ]);

    const existingAttributes = [...existingOtherAttributeRefs, ...computedAttributeRefs];

    // lookup has to be in existing Attributes array since we support only one DF for one Attribute
    return !existingAttributes.some((existing) => areObjRefsEqual(existing, attributeFilterRef));
}
