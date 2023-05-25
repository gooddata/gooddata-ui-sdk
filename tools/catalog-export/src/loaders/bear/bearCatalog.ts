// (C) 2007-2021 GoodData Corporation
import gooddata from "@gooddata/api-client-bear";
import pmap from "p-map";
import flatMap from "lodash/flatMap.js";
import range from "lodash/range.js";
import { isAttribute, isMetric, Catalog, Attribute, Metric, Fact } from "../../base/types.js";

type CatalogItemsResponse = {
    paging: {
        count: number;
    };
    totals: {
        available: number;
    };
    catalog: CatalogItem[];
};

type CatalogItem = Attribute | Metric | Fact;

const PAGE_SIZE = 100;
function getRequestOptions(offset: number = 0) {
    return {
        types: ["attribute", "metric", "fact"],
        paging: {
            limit: PAGE_SIZE,
            offset,
        },
    };
}

async function loadCatalogueItems(workspaceId: string): Promise<CatalogItem[]> {
    const options = getRequestOptions(0);
    const response: CatalogItemsResponse = await gooddata.catalogue.loadItems(workspaceId, options);
    const { totals, catalog: firstPageItems } = response;
    const { available } = totals;

    if (available <= PAGE_SIZE) {
        // bail out early if there is just one page of results
        return firstPageItems;
    }

    // otherwise figure out number of pages to load, calculate their offsets
    const lastPageNotComplete = available % PAGE_SIZE > 0 ? 1 : 0;
    const numPagesToGet = Math.trunc(available / PAGE_SIZE) - 1 + lastPageNotComplete;
    const pageOffsets = range(numPagesToGet).map((_, idx) => (idx + 1) * PAGE_SIZE);
    const loadPage = async (offset: number): Promise<CatalogItemsResponse> => {
        const pageOpts = getRequestOptions(offset);

        return gooddata.catalogue.loadItems(workspaceId, pageOpts);
    };

    // and dispatch their load in concurrent fashion
    const allPages = await pmap(pageOffsets, loadPage, { concurrency: 4 });

    return firstPageItems.concat(flatMap(allPages, (p) => p.catalog));
}

/**
 * This function loads attributes, metrics and facts from workspace's catalog. It uses the same data source
 * as the Analytical Designer.
 *
 * @param workspaceId - workspace to get metadata from
 * @returns catalog with attributes, metrics and facts
 */
export async function loadCatalog(workspaceId: string): Promise<Catalog> {
    const allCatalogueItems = await loadCatalogueItems(workspaceId);
    const result: Catalog = {
        attributes: [],
        metrics: [],
        facts: [],
    };

    allCatalogueItems.forEach((item) => {
        if (isAttribute(item)) {
            result.attributes.push(item);
        } else if (isMetric(item)) {
            result.metrics.push(item);
        } else {
            result.facts.push(item);
        }
    });

    return result;
}
