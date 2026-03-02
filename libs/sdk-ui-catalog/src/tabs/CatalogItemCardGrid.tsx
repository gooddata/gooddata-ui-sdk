// (C) 2026 GoodData Corporation

import { CatalogItemCard } from "./CatalogItemCard.js";
import type { ICatalogItem } from "../catalogItem/types.js";

type Props = {
    items: ICatalogItem[];
    onItemClick?: (item: ICatalogItem) => void;
};

export function CatalogItemCardGrid({ items, onItemClick }: Props) {
    return (
        <div className="gd-analytics-catalog__card-grid">
            {items.map((item) => (
                <CatalogItemCard key={item.identifier} item={item} onClick={onItemClick} />
            ))}
        </div>
    );
}
