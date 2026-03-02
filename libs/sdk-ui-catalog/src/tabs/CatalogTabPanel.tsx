// (C) 2026 GoodData Corporation

import type { ReactNode } from "react";

import type { UseCancelablePromiseStatus } from "@gooddata/sdk-ui";
import { LoadingSpinner } from "@gooddata/sdk-ui-kit";

import { CatalogItemCardGrid } from "./CatalogItemCardGrid.js";
import { useRecommendedItems } from "./useRecommendedItems.js";
import { useTrendingItems } from "./useTrendingItems.js";
import type { ICatalogItem } from "../catalogItem/types.js";
import { QualityScoreCard } from "../quality/QualityScoreCard.js";

type Props = {
    selectedTabId: string;
    onItemClick?: (item: ICatalogItem) => void;
};

export function CatalogTabPanel({ selectedTabId, onItemClick }: Props) {
    let content: ReactNode;

    switch (selectedTabId) {
        case "recommended":
            content = <RecommendedTabContent onItemClick={onItemClick} />;
            break;
        case "trending":
            content = <TrendingTabContent onItemClick={onItemClick} />;
            break;
        case "quality":
            content = <QualityScoreCard />;
            break;
        default:
            content = null;
    }

    return <div className="gd-analytics-catalog__tab-panel">{content}</div>;
}

type TabContentProps = {
    onItemClick?: (item: ICatalogItem) => void;
};

function RecommendedTabContent({ onItemClick }: TabContentProps) {
    const { result, status } = useRecommendedItems();
    return <AsyncCardContent items={result ?? []} status={status} onItemClick={onItemClick} />;
}

function TrendingTabContent({ onItemClick }: TabContentProps) {
    const { result, status } = useTrendingItems();
    return <AsyncCardContent items={result ?? []} status={status} onItemClick={onItemClick} />;
}

type AsyncCardContentProps = {
    items: ICatalogItem[];
    status: UseCancelablePromiseStatus;
    onItemClick?: (item: ICatalogItem) => void;
};

function AsyncCardContent({ items, status, onItemClick }: AsyncCardContentProps) {
    if (status === "pending" || status === "loading") {
        return (
            <div className="gd-analytics-catalog__tab-panel__loading">
                <LoadingSpinner />
            </div>
        );
    }

    if (items.length === 0) {
        return null;
    }

    return <CatalogItemCardGrid items={items} onItemClick={onItemClick} />;
}
