// (C) 2022-2025 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { IThemeComplementaryPalette } from "@gooddata/sdk-model";

import {
    selectDashboardId,
    useDashboardSelector,
    selectDashboardDescriptor,
    selectCurrentUser,
    selectConfig,
} from "../../model/index.js";
import { RenderMode } from "../../types.js";

import { useMetaExportData, useMetaExportImageData, useMetaPaletteData } from "./useExportData.js";
import { useDashboardRelatedFilters } from "./hooks/useDashboardRelatedFilters.js";
import { MetaExportDataAttributes } from "./types.js";

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
    const run = renderMode === "export";
    const exportData = useMetaExportData();
    const user = useDashboardSelector(selectCurrentUser);
    const conf = useDashboardSelector(selectConfig);
    const dashboardId = useDashboardSelector(selectDashboardId);
    const dashboardDescriptor = useDashboardSelector(selectDashboardDescriptor);
    const { dateFilters, attributeFilters, isError, isLoading } = useDashboardRelatedFilters(run);
    const theme = useTheme();

    if (!run) {
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
            <div {...exportData?.filters?.root} {...exportData?.filters?.rootData(isLoading, isError)}>
                {dateFilters.length > 0 || attributeFilters.length > 0 ? (
                    <>
                        {dateFilters.map((filter, i: number) => (
                            <div
                                key={i}
                                {...exportData?.filters?.dateFilter}
                                {...exportData?.filters?.filter.filterData(filter, isLoading, isError)}
                            >
                                <span {...exportData?.filters?.filter.name}>{filter?.title}</span> -{" "}
                                <span {...exportData?.filters?.filter.value}>{filter?.subtitle}</span>
                            </div>
                        ))}
                        {attributeFilters.map((filter, i: number) => (
                            <div
                                key={i}
                                {...exportData?.filters?.attributeFilter}
                                {...exportData?.filters?.filter.filterData(filter, isLoading, isError)}
                            >
                                <span {...exportData?.filters?.filter.name}>{filter?.title}</span> -{" "}
                                <span {...exportData?.filters?.filter.value}>{filter?.subtitle}</span>
                            </div>
                        ))}
                    </>
                ) : null}
            </div>
            {user?.fullName ? <div {...exportData?.user}>{user.fullName}</div> : null}
            {conf.workspaceDescriptor ? (
                <div {...exportData?.workspace}>{conf.workspaceDescriptor.title}</div>
            ) : null}
            <MetaImage image={theme?.images?.logo} type="logo" />
            <MetaImage image={theme?.images?.coverImage} type="cover-image" />
            <Palette data={theme?.palette?.complementary} />
        </div>
    );
}

function MetaImage({
    image,
    type,
}: {
    type: MetaExportDataAttributes["data-export-meta-type"];
    image?: string;
}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const onLoad = useCallback(() => {
        setLoading(false);
    }, []);
    const onError = useCallback(() => {
        setError(true);
        setLoading(false);
    }, []);

    const exportData = useMetaExportImageData(type, loading, error);
    const url = useMemo(() => image?.replace(/url\((.*)\)/, "$1"), [image]);

    if (!url) {
        return null;
    }

    return <img src={url} onLoad={onLoad} onError={onError} alt="" {...exportData} />;
}

function Palette({ data }: { data?: IThemeComplementaryPalette }) {
    const { exportData, item } = useMetaPaletteData();

    if (!data) {
        return null;
    }

    return (
        <div {...exportData}>
            {Object.entries(data).map(([key, value], i) => (
                <div {...item(key, value)} key={i} />
            ))}
        </div>
    );
}
