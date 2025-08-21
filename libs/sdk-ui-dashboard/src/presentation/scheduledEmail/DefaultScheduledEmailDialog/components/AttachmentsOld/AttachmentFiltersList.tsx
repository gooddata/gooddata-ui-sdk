// (C) 2024-2025 GoodData Corporation

import React from "react";

import { IAttachmentFilterInfo } from "../../hooks/useFiltersForDashboardScheduledExportInfo.js";

interface IAttachmentFiltersListProps {
    filters?: IAttachmentFilterInfo[];
}

export function AttachmentFiltersList({ filters }: IAttachmentFiltersListProps) {
    if (!filters) {
        return null;
    }

    return (
        <div className="gd-attachment-filters-list">
            {filters.map((filter) => (
                <FilterListItem key={filter.id} title={filter.title} subtitle={filter.subtitle} />
            ))}
        </div>
    );
}

function FilterListItem({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="gd-attachment-filters-list-item">
            <div className="gd-attachment-filters-list-item-title" title={subtitle}>
                {title}
            </div>
            <div className="gd-attachment-filters-list-item-subtitle" title={subtitle}>
                {subtitle}
            </div>
        </div>
    );
}
