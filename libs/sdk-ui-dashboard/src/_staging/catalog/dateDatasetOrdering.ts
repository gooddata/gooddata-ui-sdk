// (C) 2021-2022 GoodData Corporation
import { ICatalogDateDataset } from "@gooddata/sdk-model";

const relevanceComparator = (a: ICatalogDateDataset, b: ICatalogDateDataset) => b.relevance - a.relevance; // descending sort

const titleComparatorFactory = (mapping: Record<string, string>) => {
    return (a: ICatalogDateDataset, b: ICatalogDateDataset) => {
        return mapping[a.dataSet.title].localeCompare(mapping[b.dataSet.title]);
    };
};

export function sortByRelevanceAndTitle(
    dateDatasets: ICatalogDateDataset[],
    titleMapping: Record<string, string>,
): ICatalogDateDataset[] {
    const titleComparator = titleComparatorFactory(titleMapping);

    return dateDatasets.slice().sort((a, b) => {
        if (a.relevance === b.relevance) {
            return titleComparator(a, b);
        }
        return relevanceComparator(a, b);
    });
}

export function sanitizeDateDatasetTitle(dataset: ICatalogDateDataset): string {
    return dataset.dataSet.title.trim().replace(/^Date \((.*)\)$/, "$1");
}
