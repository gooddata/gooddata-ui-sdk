// (C) 2025 GoodData Corporation

import type { ReactNode } from "react";

export interface CatalogDetailContentRowProps {
    title: ReactNode;
    content?: ReactNode;
}

export function CatalogDetailContentRow({ title, content }: CatalogDetailContentRowProps) {
    if (!content) {
        return null;
    }
    return (
        <>
            <div className="gd-analytics-catalog-detail__tab-content__cell gd-analytics-catalog-detail__title-cell">
                {title}
            </div>
            <div className="gd-analytics-catalog-detail__tab-content__cell gd-analytics-catalog-detail__detail-cell">
                {content}
            </div>
        </>
    );
}
