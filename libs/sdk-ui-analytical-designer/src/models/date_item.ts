// (C) 2007-2026 GoodData Corporation

import { defineMessage } from "react-intl";

import { type ObjRef } from "@gooddata/sdk-model";

import { type ICatalogEntry } from "../typings/state_objects.js";

import { GRANULARITY } from "./granularity.js";

export const DATE_DATASET_ATTRIBUTE = "attr.datedataset";
export const DATE_TYPE = "date";

const dateItemBase = {
    attribute: DATE_DATASET_ATTRIBUTE,
    identifier: DATE_DATASET_ATTRIBUTE,
    granularity: GRANULARITY.YEAR,
    title: "date",
    type: "date",
    summary: defineMessage({ id: "dashboard.catalog_item.common_date_description" }).id,
    intl: true,
};

/** The synthetic date cache entry `getAttributeByIdentifier` answers for `attr.datedataset`. */
export function createDateItem(props: Partial<ICatalogEntry> & { dateDatasetRef?: ObjRef } = {}) {
    return { ...dateItemBase, ...props };
}
