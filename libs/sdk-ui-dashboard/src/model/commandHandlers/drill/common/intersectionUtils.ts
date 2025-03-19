// (C) 2023-2024 GoodData Corporation
import {
    DrillEventIntersectionElementHeader,
    IDrillEventIntersectionElement,
    IDrillIntersectionAttributeItem,
    isDrillIntersectionAttributeItem,
} from "@gooddata/sdk-ui";
import {
    areObjRefsEqual,
    ObjRef,
    IDashboardAttributeFilter,
    isAttributeDescriptor,
} from "@gooddata/sdk-model";
import { generateFilterLocalIdentifier } from "../../../store/_infra/generators.js";

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

export interface IConversionResult {
    attributeFilter: IDashboardAttributeFilter;
    primaryLabel?: ObjRef;
}

export function convertIntersectionToAttributeFilters(
    intersection: IDrillEventIntersectionElement[],
    dateDataSetsAttributesRefs: ObjRef[],
    backendSupportsElementUris: boolean,
    enableDuplicatedLabelValuesInAttributeFilter: boolean,
    enableAliasTitles = false,
    filtersCount: number = 0,
): IConversionResult[] {
    return intersection
        .map((i) => i.header)
        .filter((i: DrillEventIntersectionElementHeader) => filterIntersection(i, dateDataSetsAttributesRefs))
        .filter(isDrillIntersectionAttributeItem)
        .reduce((result, h: IDrillIntersectionAttributeItem) => {
            const ref = h.attributeHeader.ref;
            const elementValue =
                backendSupportsElementUris || enableDuplicatedLabelValuesInAttributeFilter
                    ? h.attributeHeaderItem.uri
                    : h.attributeHeaderItem.name;
            const titleObj = enableAliasTitles ? { title: h.attributeHeader.formOf?.name } : {};
            result.push({
                attributeFilter: {
                    attributeFilter: {
                        attributeElements: { uris: [elementValue] },
                        displayForm: ref,
                        negativeSelection: false,
                        localIdentifier: generateFilterLocalIdentifier(ref, filtersCount + result.length),
                        ...titleObj,
                    },
                },
                ...(enableDuplicatedLabelValuesInAttributeFilter
                    ? { primaryLabel: h.attributeHeader.primaryLabel }
                    : {}),
            });
            return result;
        }, [] as IConversionResult[]);
}

/**
 * @internal
 */
export function removeIgnoredValuesFromDrillIntersection(
    intersection: IDrillEventIntersectionElement[],
    drillIntersectionIgnoredAttributes: string[],
): IDrillEventIntersectionElement[] {
    return intersection!.filter((i) => {
        if (isAttributeDescriptor(i.header) || isDrillIntersectionAttributeItem(i.header)) {
            return !drillIntersectionIgnoredAttributes?.includes(i.header.attributeHeader.localIdentifier);
        }

        return true;
    });
}
