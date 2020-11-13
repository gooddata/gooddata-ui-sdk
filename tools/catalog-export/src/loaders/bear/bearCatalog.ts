// (C) 2007-2020 GoodData Corporation
import gooddata from "@gooddata/api-client-bear";
import pmap from "p-map";
import flatMap from "lodash/flatMap";
import range from "lodash/range";
import { isAttribute, isMetric, Catalog, Attribute, Metric, Fact } from "../../base/types";

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

async function loadCatalogueItems(projectId: string): Promise<CatalogItem[]> {
    const options = getRequestOptions(0);
    const response: CatalogItemsResponse = await gooddata.catalogue.loadItems(projectId, options);
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

        return gooddata.catalogue.loadItems(projectId, pageOpts);
    };

    // and dispatch their load in concurrent fashion
    const allPages = await pmap(pageOffsets, loadPage, { concurrency: 4 });

    return firstPageItems.concat(flatMap(allPages, (p) => p.catalog));
}

/**
 * This function loads attributes, metrics and facts from project's catalog. It uses the same data source
 * as the Analytical Designer.
 *
 * @param projectId - project to get metadata from
 * @returns catalog with attributes, metrics and facts
 */
export async function loadCatalog(projectId: string): Promise<Catalog> {
    const allCatalogueItems = await loadCatalogueItems(projectId);
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
