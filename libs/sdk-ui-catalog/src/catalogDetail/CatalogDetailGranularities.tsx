// (C) 2025 GoodData Corporation

import type { IDataSetAttributeMetadataObject } from "@gooddata/sdk-model";

type Props = {
    granularities: IDataSetAttributeMetadataObject[];
};

export function CatalogDetailGranularities({ granularities }: Props) {
    return (
        <ul className="gd-analytics-catalog-detail__granularities">
            {granularities.map((granularity) => (
                <li key={granularity.id} className="gd-analytics-catalog-detail__granularities__item">
                    {granularity.description}
                </li>
            ))}
        </ul>
    );
}
