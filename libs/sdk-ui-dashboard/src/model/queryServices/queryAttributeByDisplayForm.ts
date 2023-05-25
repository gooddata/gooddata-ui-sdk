// (C) 2022 GoodData Corporation

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
import { selectCatalogAttributes } from "../store/index.js";

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
 * from the catalog attributes. If the required attribute is not listed in the catalog
 * (e.g. deprecated attributes), the attribute metadata are fetched from the backend.
 */
async function loadAttributeByDisplayForm(
    ctx: DashboardContext,
    catalogAttributes: ICatalogAttribute[],
    displayForm: ObjRef,
): Promise<IAttributeMetadataObject> {
    const { backend, workspace } = ctx;
    const attribute = catalogAttributes.find((catalogAttribute) =>
        catalogAttribute.displayForms.some((df) => areObjRefsEqual(df, displayForm)),
    );

    if (attribute) {
        return attribute.attribute;
    }

    return backend.workspace(workspace).attributes().getAttributeByDisplayForm(displayForm);
}

async function loadAttributes(
    ctx: DashboardContext,
    catalogAttributes: ICatalogAttribute[],
    displayForms: ObjRef[],
) {
    return Promise.all(displayForms.map((df) => loadAttributeByDisplayForm(ctx, catalogAttributes, df)));
}

function* queryService(
    ctx: DashboardContext,
    query: QueryAttributeByDisplayForm,
): SagaIterator<IAttributeMetadataObject[]> {
    const {
        payload: { displayForms },
        correlationId,
    } = query;
    const catalogAttributes: ReturnType<typeof selectCatalogAttributes> = yield select(
        selectCatalogAttributes,
    );

    const attributes: SagaReturnType<typeof loadAttributes> = yield call(
        loadAttributes,
        ctx,
        catalogAttributes,
        displayForms,
    );

    if (!attributes) {
        throw invalidQueryArguments(ctx, `Cannot find attribute for given displayForm`, correlationId);
    }

    return attributes;
}
