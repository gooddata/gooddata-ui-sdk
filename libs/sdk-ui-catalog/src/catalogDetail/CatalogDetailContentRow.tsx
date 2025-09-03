// (C) 2025 GoodData Corporation
import React from "react";

export interface CatalogDetailContentRowProps {
    title: React.ReactNode;
    content?: React.ReactNode;
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
