// (C) 2023 GoodData Corporation
import flatMap from "lodash/flatMap.js";
import compact from "lodash/compact.js";
import { ICatalogAttribute, ICatalogDateDataset, ObjRef, serializeObjRef } from "@gooddata/sdk-model";

import { CatalogAttributeDataType, IAttributeData, ICatalogAttributeData } from "./types.js";

export const findCatalogAttributeByRef = (
    catalogAttributesMap: Map<string, ICatalogAttributeData>,
    ref: ObjRef,
): ICatalogAttributeData => {
    return catalogAttributesMap.get(getCatalogKey(ref));
};

export const convertToCatalogAttributeData = (
    attributes: ICatalogAttribute[],
    dates: ICatalogDateDataset[],
): Map<string, ICatalogAttributeData> => {
    const attrs: ICatalogAttributeData[] = (attributes ?? []).map((it) => ({
        type: CatalogAttributeDataType.ATTRIBUTE,
        ref: it.attribute.ref,
        title: it.attribute.title,
        icon: "gd-icon-attribute",
    }));

    const dateAttributes = flatMap(
        flatMap(dates ?? [], (it) => it.dateAttributes),
        (it) => ({
            type: CatalogAttributeDataType.DATE_ATTRIBUTE,
            ref: it.attribute.ref,
            title: it.attribute.title,
            icon: "gd-icon-date",
        }),
    );

    return [...attrs, ...dateAttributes].reduce((map, attribute) => {
        map.set(getCatalogKey(attribute.ref), attribute);
        return map;
    }, new Map<string, ICatalogAttributeData>());
};

export const convertToCatalogAttributeDataByRefs = (
    catalogAttributesMap: Map<string, ICatalogAttributeData>,
    refs: ObjRef[],
): ICatalogAttributeData[] => {
    return compact(refs.map((ref) => findCatalogAttributeByRef(catalogAttributesMap, ref)));
};

export const appendEmptyAttribute = (attributes: IAttributeData[], baseRowIndex: number) => {
    const uncompletedItemIndex = attributes.findIndex((attribute) => !attribute.completed);
    const newAttributes = [...attributes].filter((attribute) => attribute.completed);
    // if uncompleted item is above baseRowIndex, we need to insert new empty item at baseRowIndex
    const rowIndex =
        uncompletedItemIndex > -1 && uncompletedItemIndex < baseRowIndex ? baseRowIndex : baseRowIndex + 1;

    newAttributes.splice(rowIndex, 0, {});
    return newAttributes;
};

export const searchAttributes = (
    attributes: ICatalogAttributeData[],
    selectedTab: string,
    searchString: string,
) => {
    return attributes
        .filter((item) => item.type === selectedTab)
        .filter((item) => item.title.toLowerCase().includes(searchString.toLowerCase()));
};

const getCatalogKey = (ref: ObjRef) => {
    return serializeObjRef(ref);
};
