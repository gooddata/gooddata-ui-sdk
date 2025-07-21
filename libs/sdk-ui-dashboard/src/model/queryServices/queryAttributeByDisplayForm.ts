// (C) 2022-2025 GoodData Corporation

import {
    areObjRefsEqual,
    IAttributeMetadataObject,
    ICatalogAttribute,
    ObjRef,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { QueryAttributeByDisplayForm } from "../queries/attributes.js";
import { createCachedQueryService } from "../store/_infra/queryService.js";
import { DashboardContext } from "../types/commonTypes.js";
import { SagaIterator } from "redux-saga";
import { call, SagaReturnType, select } from "redux-saga/effects";
import { invalidQueryArguments } from "../events/general.js";
import { selectCatalogAttributes, selectPreloadedAttributesWithReferences } from "../store/index.js";
import { IAttributeWithReferences } from "@gooddata/sdk-backend-spi";

export const QueryAttributeByDisplayFormService = createCachedQueryService(
    "GDC.DASH/QUERY.DISPLAY.FORM.ATTRIBUTE",
    queryService,
    (query: QueryAttributeByDisplayForm) => {
        const {
            payload: { displayForms },
        } = query;

        return displayForms.map((df) => serializeObjRef(df)).join();
    },
);

/**
 * Loads the attribute metadata for given display form. Primarily the metadata are loaded
 * from the preloaded filter attributes or catalog attributes. If the required attribute is not listed in the preloaded attributes or catalog
 * (e.g. deprecated attributes), the attribute metadata are fetched from the backend.
 */
async function loadAttributeByDisplayForm(
    ctx: DashboardContext,
    catalogAttributes: ICatalogAttribute[],
    displayFormRef: ObjRef,
    preloadedAttributesWithReferences?: IAttributeWithReferences[],
): Promise<IAttributeMetadataObject> {
    const { backend, workspace } = ctx;
    // First try to get the attribute from preloaded filters
    let attribute = preloadedAttributesWithReferences?.find((attr) =>
        attr.attribute.displayForms.some((df) => areObjRefsEqual(df.ref, displayFormRef)),
    )?.attribute;

    if (!attribute) {
        // If the attribute is not in preloaded filters, try to get it from catalog attributes
        attribute = catalogAttributes.find((catalogAttribute) =>
            catalogAttribute.displayForms.some((df) => areObjRefsEqual(df.ref, displayFormRef)),
        )?.attribute;
    }

    if (attribute) {
        return attribute;
    }

    // If attribute is not in preloaded filters or catalog attributes, fetch it from backend
    return backend.workspace(workspace).attributes().getAttributeByDisplayForm(displayFormRef);
}

async function loadAttributes(
    ctx: DashboardContext,
    catalogAttributes: ICatalogAttribute[],
    displayForms: ObjRef[],
    preloadedAttributesWithReferences?: IAttributeWithReferences[],
) {
    return Promise.all(
        displayForms.map((df) =>
            loadAttributeByDisplayForm(ctx, catalogAttributes, df, preloadedAttributesWithReferences),
        ),
    );
}

function* queryService(
    ctx: DashboardContext,
    query: QueryAttributeByDisplayForm,
): SagaIterator<IAttributeMetadataObject[]> {
    const {
        payload: { displayForms },
        correlationId,
    } = query;
    const preloadedAttributesWithReferences: ReturnType<typeof selectPreloadedAttributesWithReferences> =
        yield select(selectPreloadedAttributesWithReferences);
    const catalogAttributes: ReturnType<typeof selectCatalogAttributes> =
        yield select(selectCatalogAttributes);

    const attributes: SagaReturnType<typeof loadAttributes> = yield call(
        loadAttributes,
        ctx,
        catalogAttributes,
        displayForms,
        preloadedAttributesWithReferences,
    );

    if (!attributes) {
        throw invalidQueryArguments(ctx, `Cannot find attribute for given displayForm`, correlationId);
    }

    return attributes;
}
