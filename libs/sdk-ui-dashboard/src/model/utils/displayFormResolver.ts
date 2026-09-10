// (C) 2021-2025 GoodData Corporation
import { type SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";

import { type IAttributeDisplayFormMetadataObject, type ObjRef } from "@gooddata/sdk-model";

import {
    loadComputedAttributesByRefs,
    partitionComputedAttributeRefs,
} from "../../_staging/catalog/computedAttributes.js";
import { type ObjRefMap, newDisplayFormMap } from "../../_staging/metadata/objRefMap.js";
import { selectAllCatalogDisplayFormsMap } from "../store/catalog/catalogSelectors.js";
import { type DashboardContext } from "../types/commonTypes.js";
import { type PromiseFnReturnType } from "../types/sagas.js";

async function loadDisplayFormsMetadata(
    ctx: DashboardContext,
    refs: ObjRef[],
): Promise<IAttributeDisplayFormMetadataObject[]> {
    if (!refs.length) {
        return [];
    }

    // a computed-attribute-typed display form ref never matches a label; it must resolve through
    // the computedAttributes service, which carries the fabricated display form in its metadata
    const { computedAttributeRefs, otherRefs } = partitionComputedAttributeRefs(refs);

    const [computedAttributes, displayForms] = await Promise.all([
        loadComputedAttributesByRefs(ctx.backend, ctx.workspace, computedAttributeRefs),
        otherRefs.length
            ? ctx.backend.workspace(ctx.workspace).attributes().getAttributeDisplayForms(otherRefs)
            : Promise.resolve([]),
    ]);

    return [...displayForms, ...computedAttributes.flatMap((ca) => ca.displayForms)];
}

export type DisplayFormResolutionResult = {
    resolved: ObjRefMap<IAttributeDisplayFormMetadataObject>;
    missing: ObjRef[];
};

/**
 * Given a set of display form refs (which may be of any type.. uri or id), this function returns a list of
 * attribute display form metadata objects.
 *
 * @param ctx - dashboard context in which the resolution is done
 * @param refs - ObjRefs of display forms; the type of ObjRef can be either uri or id ref, the function will resolve it regardless
 * @param displayForms - specify mapping of display forms to use for in-memory resolution of refs to metadata objects; if
 *  not specified, the generator will retrieve all catalog display forms from state
 */
export function* resolveDisplayFormMetadata(
    ctx: DashboardContext,
    refs: ObjRef[],
    displayForms?: ObjRefMap<IAttributeDisplayFormMetadataObject>,
): SagaIterator<DisplayFormResolutionResult> {
    const catalogDisplayForms: ReturnType<typeof selectAllCatalogDisplayFormsMap> =
        displayForms || (yield select(selectAllCatalogDisplayFormsMap));

    const resolvedDisplayForms: IAttributeDisplayFormMetadataObject[] = [];
    const tryLoadDisplayForms: ObjRef[] = [];

    refs.forEach((ref) => {
        const catalogDisplayForm = catalogDisplayForms.get(ref);

        if (catalogDisplayForm) {
            resolvedDisplayForms.push(catalogDisplayForm);
        } else {
            tryLoadDisplayForms.push(ref);
        }
    });

    const loadedDisplayForms: PromiseFnReturnType<typeof loadDisplayFormsMetadata> = yield call(
        loadDisplayFormsMetadata,
        ctx,
        tryLoadDisplayForms,
    );
    const loadedDisplayFormsMap = newDisplayFormMap(loadedDisplayForms);
    const missing: ObjRef[] = [];

    tryLoadDisplayForms.forEach((ref) => {
        const loadedDisplayForm = loadedDisplayFormsMap.get(ref);

        if (loadedDisplayForm) {
            resolvedDisplayForms.push(loadedDisplayForm);
        } else {
            missing.push(ref);
        }
    });

    return {
        resolved: newDisplayFormMap(resolvedDisplayForms),
        missing,
    };
}
