// (C) 2025-2026 GoodData Corporation

import type { ReactNode } from "react";

export interface ICatalogDetailContentRowProps {
    title: ReactNode;
    content?: ReactNode;
}

export function CatalogDetailContentRow({ title, content }: ICatalogDetailContentRowProps) {
    if (!content) {
        return null;
    }
    return (
        <>
            <dt className="gd-analytics-catalog-detail__tab-content__cell gd-analytics-catalog-detail__title-cell">
                {title}
            </dt>
            <dd className="gd-analytics-catalog-detail__tab-content__cell gd-analytics-catalog-detail__detail-cell">
                {content}
            </dd>
        </>
    );
}
