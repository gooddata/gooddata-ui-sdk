// (C) 2022 GoodData Corporation
import { ICatalogDateDataset } from "@gooddata/sdk-model";
import { getRecommendedDateDataset } from "@gooddata/sdk-ui-kit";

export function getRecommendedCatalogDateDataset(
    dateDatasets: readonly ICatalogDateDataset[],
): ICatalogDateDataset | undefined {
    const recommendedDateDataSetId = getRecommendedDateDataset(
        dateDatasets.map((ds) => {
            return {
                id: ds.dataSet.id,
                title: ds.dataSet.title,
            };
        }),
    )?.id;

    return recommendedDateDataSetId
        ? dateDatasets.find((ds) => ds.dataSet.id === recommendedDateDataSetId)
        : undefined;
}
