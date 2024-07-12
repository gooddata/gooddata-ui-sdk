// (C) 2023-2024 GoodData Corporation

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

interface IConversionResult {
    attributeFilter: IAttributeFilter;
    primaryLabel?: ObjRef;
}

export function convertIntersectionToAttributeFilters(
    intersection: IDrillEventIntersectionElement[],
    dateDataSetsAttributesRefs: ObjRef[],
    backendSupportsElementUris: boolean,
    enableDuplicatedLabelValuesInAttributeFilter: boolean,
): IConversionResult[] {
    return intersection
        .map((i) => i.header)
        .filter((i: DrillEventIntersectionElementHeader) => filterIntersection(i, dateDataSetsAttributesRefs))
        .filter(isDrillIntersectionAttributeItem)
        .reduce((result, h: IDrillIntersectionAttributeItem) => {
            const ref = h.attributeHeader.ref;
            if (backendSupportsElementUris || enableDuplicatedLabelValuesInAttributeFilter) {
                result.push({
                    attributeFilter: newPositiveAttributeFilter(ref, {
                        uris: [h.attributeHeaderItem.uri],
                    }),
                    primaryLabel: h.attributeHeader.primaryLabel,
                });
            } else {
                result.push({
                    attributeFilter: newPositiveAttributeFilter(ref, {
                        uris: [h.attributeHeaderItem.name],
                    }),
                    ...(enableDuplicatedLabelValuesInAttributeFilter
                        ? { primaryLabel: h.attributeHeader.primaryLabel }
                        : {}),
                });
            }
            return result;
        }, [] as IConversionResult[]);
}
