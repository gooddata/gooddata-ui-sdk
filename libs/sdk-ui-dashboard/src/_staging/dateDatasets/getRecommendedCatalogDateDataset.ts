// (C) 2022 GoodData Corporation
import { ICatalogDateDataset } from "@gooddata/sdk-model";
import { getRecommendedDateDataset, IDateDataset } from "@gooddata/sdk-ui-kit";

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
