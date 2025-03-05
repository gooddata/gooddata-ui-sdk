// (C) 2022-2025 GoodData Corporation
import React from "react";

import { useMetaExportData } from "./useExportData.js";
import { RenderMode } from "../../types.js";
import { selectDashboardId, useDashboardSelector, selectDashboardDescriptor } from "../../model/index.js";

import { useDashboardRelatedFilters } from "./hooks/useDashboardRelatedFilters.js";

/**
 * @alpha
 */
export interface DefaultDashboardExportVariablesProps {
    renderMode: RenderMode;
}

/**
 * @alpha
 */
export function DefaultDashboardExportVariables({ renderMode }: DefaultDashboardExportVariablesProps) {
    const exportData = useMetaExportData();
    const dashboardId = useDashboardSelector(selectDashboardId);
    const dashboardDescriptor = useDashboardSelector(selectDashboardDescriptor);
    const { dateFilters, attributeFilters } = useDashboardRelatedFilters();

    if (renderMode !== "export") {
        return null;
    }

    return (
        <div className="gd-dashboard-meta" {...exportData?.root}>
            <div {...exportData?.id}>{dashboardId}</div>
            {dashboardDescriptor.title ? <div {...exportData?.title}>{dashboardDescriptor.title}</div> : null}
            {dashboardDescriptor.description ? (
                <div {...exportData?.description}>{dashboardDescriptor.description}</div>
            ) : null}
            {dashboardDescriptor.tags && dashboardDescriptor.tags.length > 0 ? (
                <div {...exportData?.tags?.root}>
                    {dashboardDescriptor.tags.map((tag, i) => (
                        <span key={i} {...exportData?.tags?.tag}>
                            {tag}
                        </span>
                    ))}
                </div>
            ) : null}
            {dateFilters.length > 0 || attributeFilters.length > 0 ? (
                <div {...exportData?.filters?.root}>
                    {dateFilters.map((filter, i: number) => (
                        <div key={i} {...exportData?.filters?.dateFilter}>
                            <span {...exportData?.filters?.filter.name}>{filter?.title}</span> -{" "}
                            <span {...exportData?.filters?.filter.value}>{filter?.subtitle}</span>
                        </div>
                    ))}
                    {attributeFilters.map((filter, i: number) => (
                        <div key={i} {...exportData?.filters?.attributeFilter}>
                            <span {...exportData?.filters?.filter.name}>{filter?.title}</span> -{" "}
                            <span {...exportData?.filters?.filter.value}>{filter?.subtitle}</span>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
