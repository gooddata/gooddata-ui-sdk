// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { DrillToDashboard } from "../../commands/drill";
import {
    DashboardDrillToDashboardResolved,
    drillToDashboardRequested,
    drillToDashboardResolved,
} from "../../events/drill";
import {
    DrillEventIntersectionElementHeader,
    IDrillEventIntersectionElement,
    IDrillIntersectionAttributeItem,
    isDrillIntersectionAttributeItem,
} from "@gooddata/sdk-ui";
import { areObjRefsEqual, IAttributeFilter, newPositiveAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import { selectCatalogDateAttributes } from "../../store/catalog/catalogSelectors";
import { queryWidgetFilters } from "../../queries";
import { query } from "../../store/_infra/queryCall";

export function* drillToDashboardHandler(
    ctx: DashboardContext,
    cmd: DrillToDashboard,
): SagaIterator<DashboardDrillToDashboardResolved> {
    yield put(
        drillToDashboardRequested(
            ctx,
            cmd.payload.drillDefinition,
            cmd.payload.drillEvent,
            cmd.correlationId,
        ),
    );

    const dateAttributes: ReturnType<typeof selectCatalogDateAttributes> = yield select(
        selectCatalogDateAttributes,
    );

    const drillFilters = convertIntersectionToAttributeFilters(
        cmd.payload.drillEvent.drillContext.intersection!,
        dateAttributes.map((dA) => dA.attribute.ref),
    );

    const widgetFilters = yield call(
        query,
        queryWidgetFilters(cmd.payload.drillEvent.widgetRef!, drillFilters),
    );

    return drillToDashboardResolved(
        ctx,
        widgetFilters,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        cmd.correlationId,
    );
}

/**
 *  For correct drill intersection that should be converted into AttributeFilters must be drill intersection:
 *  1. AttributeItem
 *  2. Not a date attribute
 */
function filterIntersection(
    intersection: DrillEventIntersectionElementHeader,
    dateDataSetsAttributesRefs: ObjRef[],
): boolean {
    const attributeItem = isDrillIntersectionAttributeItem(intersection) ? intersection : undefined;
    const ref = attributeItem?.attributeHeader?.formOf?.ref;

    return ref ? !dateDataSetsAttributesRefs.some((ddsRef) => areObjRefsEqual(ddsRef, ref)) : false;
}

export function convertIntersectionToAttributeFilters(
    intersection: IDrillEventIntersectionElement[],
    dateDataSetsAttributesRefs: ObjRef[],
): IAttributeFilter[] {
    return intersection
        .map((i) => i.header)
        .filter((i: DrillEventIntersectionElementHeader) => filterIntersection(i, dateDataSetsAttributesRefs))
        .filter(isDrillIntersectionAttributeItem)
        .map(
            (h: IDrillIntersectionAttributeItem): IAttributeFilter =>
                newPositiveAttributeFilter(h.attributeHeader.ref, { uris: [h.attributeHeaderItem.uri] }),
        );
}
