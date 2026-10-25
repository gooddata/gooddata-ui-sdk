// (C) 2007-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type IMetadataObject } from "@gooddata/sdk-model";

import { backend } from "../backend.js";
import { type IOrganizedCatalogItem, type IOrganizedCatalogTooltipDetails } from "../typings/catalog.js";

import {
    getComputedAttributeExpressionTokens as loadComputedAttributeExpressionTokens,
    getMeasureExpressionTokens as loadMeasureExpressionTokens,
} from "./metric_details_loader_api.js";

const ELEMENT_COUNT = 5;

function loadAttrElements(attribute: IOrganizedCatalogItem, projectId: string) {
    return backend
        .workspace(projectId)
        .attributes()
        .elements()
        .forDisplayForm(attribute.dfRef)
        .withLimit(ELEMENT_COUNT)
        .query();
}

function loadFactDataset(item: IOrganizedCatalogItem, projectId: string): Promise<IMetadataObject> {
    return backend.workspace(projectId).facts().getFactDatasetMeta(item.ref);
}

function loadAttributeDataset(item: IOrganizedCatalogItem, projectId: string): Promise<IMetadataObject> {
    return backend.workspace(projectId).attributes().getAttributeDatasetMeta(item.ref);
}

type DetailPartLoader = (
    item: IOrganizedCatalogItem,
    projectId: string,
    intl: IntlShape,
) => Promise<IOrganizedCatalogTooltipDetails>;

/**
 * Each catalog item type is loaded as a set of independent detail "parts". Splitting the loading
 * this way lets callers render each part as soon as it resolves, instead of waiting for the slowest
 * one. For attributes in particular, the (fast) dataset info is a separate part from the (potentially
 * slow) value samples, so users can see which dataset an attribute belongs to without waiting for the
 * CollectLabelElements query to finish.
 */
const detailLoaders: {
    [detailLoader in IOrganizedCatalogItem["type"]]?: DetailPartLoader[];
} = {
    metric: [
        async (item: IOrganizedCatalogItem, projectId: string, intl: IntlShape) => {
            const tokenizedExpression = await loadMeasureExpressionTokens(intl, projectId, item.ref);
            return { metricMaql: tokenizedExpression };
        },
    ],

    attribute: [
        async (item: IOrganizedCatalogItem, projectId: string) => {
            const dataset = await loadAttributeDataset(item, projectId);
            return { dataset };
        },
        async (item: IOrganizedCatalogItem, projectId: string) => {
            const validElements = await loadAttrElements(item, projectId);
            return {
                attrElements: validElements.items,
                attrElementsTotalCount: validElements.totalCount,
                attrElementsNumberFormat: validElements.numberFormat,
            };
        },
    ],

    fact: [
        async (item: IOrganizedCatalogItem, projectId: string) => {
            const dataset = await loadFactDataset(item, projectId);
            return { dataset };
        },
    ],

    // A computed attribute is an attribute with values AND a MAQL definition, so both are shown:
    // the values like an attribute's, the definition resolved the same way a metric's is.
    computedAttribute: [
        async (item: IOrganizedCatalogItem, projectId: string) => {
            const validElements = await loadAttrElements(item, projectId);
            return {
                attrElements: validElements.items,
                attrElementsTotalCount: validElements.totalCount,
                attrElementsNumberFormat: validElements.numberFormat,
            };
        },
        async (item: IOrganizedCatalogItem, projectId: string, intl: IntlShape) => {
            const tokenizedExpression = await loadComputedAttributeExpressionTokens(
                intl,
                projectId,
                item.ref,
            );
            return { metricMaql: tokenizedExpression };
        },
    ],
};

/**
 * Kicks off loading of all detail parts for the given item and returns the in-flight promises. The
 * parts run concurrently; the caller is expected to consume each promise independently so a resolved
 * part can be shown without waiting for the others.
 */
export function loadDetailParts(
    item: IOrganizedCatalogItem,
    projectId: string,
    intl: IntlShape,
): Promise<IOrganizedCatalogTooltipDetails>[] {
    const loaders = detailLoaders[item.type];
    if (!loaders) {
        throw new Error(`Unsupported item type = '${item.type}' for detail request`);
    }

    return loaders.map((loader) => loader(item, projectId, intl));
}
