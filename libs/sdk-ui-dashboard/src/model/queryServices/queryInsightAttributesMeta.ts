// (C) 2021-2026 GoodData Corporation

import { uniqBy } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import {
    type IAttributeDisplayFormMetadataObject,
    type IAttributeMetadataObject,
    type ICatalogAttribute,
    type ICatalogDateAttribute,
    type IInsightDefinition,
    type InsightDisplayFormUsage,
    type ObjRef,
    insightDisplayFormUsage,
    insightRef,
    isObjRef,
    objRefToString,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { type ObjRefMap } from "../../_staging/metadata/objRefMap.js";
import { invalidQueryArguments } from "../events/general.js";
import { type IInsightAttributesMeta, type IQueryInsightAttributesMeta } from "../queries/insights.js";
import { type QueryCacheEntryResult, createCachedQueryService } from "../store/_infra/queryService.js";
import {
    selectAllCatalogAttributesMap,
    selectAllCatalogDisplayFormsMap,
} from "../store/catalog/catalogSelectors.js";
import { selectInsightByRef } from "../store/insights/insightsSelectors.js";
import { type DashboardState } from "../store/types.js";
import { type DashboardContext } from "../types/commonTypes.js";

export const QueryInsightAttributesMetaService = createCachedQueryService(
    "GDC.DASH/QUERY.INSIGHT.ATTRIBUTE.META",
    queryService,
    (query: IQueryInsightAttributesMeta) => {
        const {
            payload: { insightOrRef },
        } = query;
        const ref = isObjRef(insightOrRef) ? insightOrRef : insightRef(insightOrRef);

        return serializeObjRef(ref);
    },
);

/**
 * Type of the selector that will return attribute metadata for an insight.
 * @internal
 */
export type selectInsightAttributesMetaType = (
    query: IQueryInsightAttributesMeta,
) => (state: DashboardState, ...params: any[]) => QueryCacheEntryResult<IInsightAttributesMeta> | undefined;

/**
 * Selector that will return attribute metadata for an insight. The input to the selector is the dashboard query that is used
 * to obtain and cache the data.
 *
 * This selector will return undefined if the query to obtain the data for particular insight was not yet fired or
 * processed. Otherwise will return object containing `status` of the data retrieval; if the `status` is
 * `'success'` then the `result` prop will contain the data.
 *
 * @remarks see {@link IQueryInsightAttributesMeta}
 * @internal
 */
export const selectInsightAttributesMeta: selectInsightAttributesMetaType =
    QueryInsightAttributesMetaService.cache.selectQueryResult;

//
// Query implementation
//

async function loadDisplayFormsAndAttributes(ctx: DashboardContext, displayFormRefs: ObjRef[]) {
    const { backend, workspace } = ctx;

    const loadedDisplayForms = await backend
        .workspace(workspace)
        .attributes()
        .getAttributeDisplayForms(displayFormRefs);
    const loadedAttributes = await backend
        .workspace(workspace)
        .attributes()
        .getAttributes(loadedDisplayForms.map((df) => df.attribute));

    return {
        loadedDisplayForms,
        loadedAttributes,
    };
}

/**
 * Loads insight attribute and display form metadata for particular insight display form usage.
 *
 * This function will first attempt to find display forms & attributes in the catalog - for a quick in memory hit.
 *
 * However in corner cases some of the display forms and attributes may not be stored in catalog. That is the case when dashboard
 * contains an insight created from date datasets created from custom CSVs. These are not stored in the 'default' catalog
 * that is part of the dashboard component's state. That's when the function falls back to load the metadata from backend.
 */
async function createInsightAttributesMeta(
    ctx: DashboardContext,
    usage: InsightDisplayFormUsage,
    catalogDisplayForms: ObjRefMap<IAttributeDisplayFormMetadataObject>,
    catalogAttributes: ObjRefMap<ICatalogAttribute | ICatalogDateAttribute>,
): Promise<IInsightAttributesMeta> {
    const allUsedRefs = [...usage.inAttributes, ...usage.inFilters, ...usage.inMeasureFilters];
    const displayFormsFromCatalog: IAttributeDisplayFormMetadataObject[] = [];
    const missingDisplayForms: ObjRef[] = [];

    allUsedRefs.forEach((ref) => {
        const catalogDisplayForm = catalogDisplayForms.get(ref);

        if (catalogDisplayForm) {
            displayFormsFromCatalog.push(catalogDisplayForm);
        } else {
            missingDisplayForms.push(ref);
        }
    });

    const attributesFromCatalog: IAttributeMetadataObject[] = displayFormsFromCatalog.map((df) => {
        const catalogAttribute = catalogAttributes.get(df.attribute);

        // if this bombs there must be something seriously wrong because it means a display form is in catalog
        // but the attribute to which it belongs is not. such a thing can only happen if something is messing
        // around with the catalog state stored in the component.
        invariant(catalogAttribute, "dashboard metadata catalog is corrupted");

        return catalogAttribute.attribute;
    });

    const { loadedDisplayForms, loadedAttributes } = await loadDisplayFormsAndAttributes(
        ctx,
        missingDisplayForms,
    );

    return {
        usage,
        attributes: uniqBy([...attributesFromCatalog, ...loadedAttributes], (a) => serializeObjRef(a.ref)),
        displayForms: uniqBy([...displayFormsFromCatalog, ...loadedDisplayForms], (df) =>
            serializeObjRef(df.ref),
        ),
    };
}

function* queryService(
    ctx: DashboardContext,
    query: IQueryInsightAttributesMeta,
): SagaIterator<IInsightAttributesMeta> {
    const {
        correlationId,
        payload: { insightOrRef },
    } = query;
    let insight: IInsightDefinition;

    if (isObjRef(insightOrRef)) {
        insight = yield select(selectInsightByRef(insightOrRef));

        if (!insight) {
            throw invalidQueryArguments(
                ctx,
                `Insight with ref ${objRefToString(insightOrRef)} does not exist on the dashboard`,
                correlationId,
            );
        }
    } else {
        insight = insightOrRef;
    }

    const usage = insightDisplayFormUsage(insight);
    const catalogDisplayForms: ReturnType<typeof selectAllCatalogDisplayFormsMap> = yield select(
        selectAllCatalogDisplayFormsMap,
    );
    const catalogAttributes: ReturnType<typeof selectAllCatalogAttributesMap> = yield select(
        selectAllCatalogAttributesMap,
    );

    return yield call(createInsightAttributesMeta, ctx, usage, catalogDisplayForms, catalogAttributes);
}
