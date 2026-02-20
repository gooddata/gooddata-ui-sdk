// (C) 2025-2026 GoodData Corporation

import { type ICatalogItem } from "../catalogItem/types.js";
import { Lineage } from "../lineage/Lineage.js";

type Props = {
    item: ICatalogItem;
};

export function CatalogDetailTabLineage({ item }: Props) {
    return (
        <div className="gd-analytics-catalog-detail__tab-lineage">
            <Lineage item={item} />
        </div>
    );
}
