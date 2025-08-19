// (C) 2024-2025 GoodData Corporation

import React from "react";

import { IAttachmentFilterInfo } from "../../hooks/useFiltersForDashboardScheduledExportInfo.js";

interface IAttachmentFiltersListProps {
    filters?: IAttachmentFilterInfo[];
}

export const AttachmentFiltersList: React.FC<IAttachmentFiltersListProps> = ({ filters }) => {
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
};

const FilterListItem: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
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
};
