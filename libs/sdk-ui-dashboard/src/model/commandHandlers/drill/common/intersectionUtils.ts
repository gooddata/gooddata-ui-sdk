// (C) 2023 GoodData Corporation

import {
    DrillEventIntersectionElementHeader,
    IDrillEventIntersectionElement,
    IDrillIntersectionAttributeItem,
    isDrillIntersectionAttributeItem,
} from "@gooddata/sdk-ui";
import { areObjRefsEqual, ObjRef, IAttributeFilter, newPositiveAttributeFilter } from "@gooddata/sdk-model";

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
    backendSupportsElementUris: boolean,
): IAttributeFilter[] {
    return intersection
        .map((i) => i.header)
        .filter((i: DrillEventIntersectionElementHeader) => filterIntersection(i, dateDataSetsAttributesRefs))
        .filter(isDrillIntersectionAttributeItem)
        .map((h: IDrillIntersectionAttributeItem): IAttributeFilter => {
            if (backendSupportsElementUris) {
                return newPositiveAttributeFilter(h.attributeHeader.ref, {
                    uris: [h.attributeHeaderItem.uri],
                });
            } else {
                return newPositiveAttributeFilter(h.attributeHeader.ref, {
                    uris: [h.attributeHeaderItem.name],
                });
            }
        });
}
