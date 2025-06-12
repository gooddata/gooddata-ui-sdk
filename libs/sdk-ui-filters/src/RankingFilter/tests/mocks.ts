// (C) 2020 GoodData Corporation

import { uriRef, idRef, localIdRef, IRankingFilter } from "@gooddata/sdk-model";
import { IMeasureDropdownItem, IAttributeDropdownItem } from "../types.js";

export const attribute1Ref = uriRef("attribute1");
export const attribute2Ref = idRef("attribute2");
export const attribute3Ref = localIdRef("attribute3");
export const attribute4Ref = localIdRef("attribute4");

export const measure1Ref = localIdRef("measure1");
export const measure2Ref = localIdRef("measure2");
export const measure3Ref = localIdRef("measure3");
export const measure4Ref = localIdRef("measure4");
export const measure5Ref = localIdRef("measure5");

export const date1Ref = localIdRef("date1");

export const defaultFilter: IRankingFilter = {
    rankingFilter: {
        measure: measure1Ref,
        operator: "TOP",
        value: 10,
    },
};

export const filterWithRichSetting: IRankingFilter = {
    rankingFilter: {
        measure: measure3Ref,
        attributes: [attribute1Ref, attribute2Ref, attribute3Ref, attribute4Ref],
        operator: "BOTTOM",
        value: 100,
    },
};

export const measureItems: IMeasureDropdownItem[] = [
    { title: "Measure 1", ref: measure1Ref },
    { title: "Measure 2", ref: measure2Ref },
    { title: "Measure 3", ref: measure3Ref },
    { title: "Measure 4", ref: measure4Ref },
    { title: "Measure 5", ref: measure5Ref },
];

export const attributeItems: IAttributeDropdownItem[] = [
    { title: "Attribute 1", ref: attribute1Ref, type: "ATTRIBUTE" },
    { title: "Attribute 2", ref: attribute2Ref, type: "ATTRIBUTE" },
    { title: "Attribute 3", ref: attribute3Ref, type: "ATTRIBUTE" },
    { title: "Date", ref: date1Ref, type: "DATE" },
    { title: "Attribute 4", ref: attribute4Ref, type: "ATTRIBUTE" },
];
