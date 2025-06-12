// (C) 2021-2022 GoodData Corporation
import { ObjRef, IAttributeMetadataObject } from "@gooddata/sdk-model";
import { SagaIterator } from "redux-saga";
import { selectAllCatalogAttributesMap } from "../store/catalog/catalogSelectors.js";
import { call, select } from "redux-saga/effects";
import { DashboardContext } from "../types/commonTypes.js";
import { PromiseFnReturnType } from "../types/sagas.js";
import { newAttributeMap, ObjRefMap } from "../../_staging/metadata/objRefMap.js";

async function loadAttributesMetadata(
    ctx: DashboardContext,
    refs: ObjRef[],
): Promise<IAttributeMetadataObject[]> {
    if (!refs.length) {
        return [];
    }

    return ctx.backend.workspace(ctx.workspace).attributes().getAttributes(refs);
}

export interface AttributeResolutionResult {
    resolved: ObjRefMap<IAttributeMetadataObject>;
    missing: ObjRef[];
}

/**
 * Given a set of attribute refs (which may be of any type.. uri or id), this function returns a list of
 * attribute metadata objects.
 *
 * @param ctx - dashboard context in which the resolution is done
 * @param refs - ObjRefs of display forms; the type of ObjRef can be either uri or id ref, the function will resolve it regardless
 * @param attributes - specify mapping of attributes to use for in-memory resolution of refs to metadata objects; if
 *  not specified, the generator will retrieve all catalog attributes from state
 */
export function* resolveAttributeMetadata(
    ctx: DashboardContext,
    refs: ObjRef[],
    attributes?: ObjRefMap<IAttributeMetadataObject>,
): SagaIterator<AttributeResolutionResult> {
    const catalogAttributes: ReturnType<typeof selectAllCatalogAttributesMap> = attributes
        ? attributes
        : yield select(selectAllCatalogAttributesMap);

    const resolvedAttributes: IAttributeMetadataObject[] = [];
    const tryLoadAttributes: ObjRef[] = [];

    refs.forEach((ref) => {
        const catalogAttribute = catalogAttributes.get(ref);

        if (catalogAttribute) {
            resolvedAttributes.push(catalogAttribute.attribute);
        } else {
            tryLoadAttributes.push(ref);
        }
    });

    const loadedAttributes: PromiseFnReturnType<typeof loadAttributesMetadata> = yield call(
        loadAttributesMetadata,
        ctx,
        tryLoadAttributes,
    );
    const loadedAttributesMap = newAttributeMap(loadedAttributes);
    const missing: ObjRef[] = [];

    tryLoadAttributes.forEach((ref) => {
        const loadedAttribute = loadedAttributesMap.get(ref);

        if (loadedAttribute) {
            resolvedAttributes.push(loadedAttribute);
        } else {
            missing.push(ref);
        }
    });

    return {
        resolved: newAttributeMap(resolvedAttributes),
        missing,
    };
}
