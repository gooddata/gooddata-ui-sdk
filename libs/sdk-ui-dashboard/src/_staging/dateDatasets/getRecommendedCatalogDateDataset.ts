// (C) 2022-2025 GoodData Corporation
import { type ICatalogDateDataset } from "@gooddata/sdk-model";
import { type IDateDataset, getRecommendedDateDataset } from "@gooddata/sdk-ui-kit";

export function getRecommendedCatalogDateDataset(
    dateDatasets: readonly ICatalogDateDataset[],
): ICatalogDateDataset | undefined {
    const recommendedDateDataSetId = getRecommendedDateDataset(
        dateDatasets.map((ds): IDateDataset => {
            return {
                id: ds.dataSet.id,
                title: ds.dataSet.title,
                relevance: ds.relevance,
            };
        }),
    )?.id;

    return recommendedDateDataSetId
        ? dateDatasets.find((ds) => ds.dataSet.id === recommendedDateDataSetId)
        : undefined;
}
