// (C) 2019-2026 GoodData Corporation

import { type CatalogItem } from "@gooddata/sdk-model";

import { type IOrganizedCatalogItem } from "../typings/catalog.js";

import { getCatalogAttribute, getCatalogFact, getCatalogMeasure } from "./catalog.test.helpers.js";

export const catalogMeasures: CatalogItem[] = [getCatalogMeasure(1), getCatalogMeasure(2), getCatalogFact(1)];

export const catalogAttributes: CatalogItem[] = [getCatalogAttribute(1), getCatalogAttribute(2)];

export const catalogItems: CatalogItem[] = [...catalogMeasures, ...catalogAttributes];

export const organizedCatalogItems: IOrganizedCatalogItem[] = [
    {
        title: "Metric1",
        ref: {
            identifier: "metric1",
        },
        identifier: "metric1",
        type: "metric",
    },
    {
        title: "Metric2",
        ref: {
            identifier: "metric2",
        },
        identifier: "metric2",
        type: "metric",
    },
    {
        title: "Fact1",
        ref: {
            identifier: "fact1",
        },
        identifier: "fact1",
        type: "fact",
    },
    {
        title: "Attribute1",
        ref: {
            identifier: "attribute1",
        },
        identifier: "attribute1",
        type: "attribute",
        dfRef: {
            identifier: "df1",
        },
    },
    {
        title: "Attribute2",
        ref: {
            identifier: "attribute2",
        },
        identifier: "attribute2",
        type: "attribute",
        dfRef: {
            identifier: "df2",
        },
    },
];
