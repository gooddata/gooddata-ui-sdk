// (C) 2021-2022 GoodData Corporation
import { ObjRef, IAttributeDisplayFormMetadataObject } from "@gooddata/sdk-model";
import { SagaIterator } from "redux-saga";
import { selectAllCatalogDisplayFormsMap } from "../store/catalog/catalogSelectors.js";
import { call, select } from "redux-saga/effects";
import { DashboardContext } from "../types/commonTypes.js";
import { PromiseFnReturnType } from "../types/sagas.js";
import { newDisplayFormMap, ObjRefMap } from "../../_staging/metadata/objRefMap.js";

async function loadDisplayFormsMetadata(
    ctx: DashboardContext,
    refs: ObjRef[],
): Promise<IAttributeDisplayFormMetadataObject[]> {
    if (!refs.length) {
        return [];
    }

    return ctx.backend.workspace(ctx.workspace).attributes().getAttributeDisplayForms(refs);
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
    const catalogDisplayForms: ReturnType<typeof selectAllCatalogDisplayFormsMap> = displayForms
        ? displayForms
        : yield select(selectAllCatalogDisplayFormsMap);

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
