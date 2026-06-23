// (C) 2022-2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { type IThemeComplementaryPalette } from "@gooddata/sdk-model";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectConfig } from "../../model/store/config/configSelectors.js";
import { selectDashboardDescriptor, selectDashboardId } from "../../model/store/meta/metaSelectors.js";
import { selectActiveTabExportParameters } from "../../model/store/tabs/parameters/parametersSelectors.js";
import { selectCurrentUser } from "../../model/store/user/userSelectors.js";
import { type RenderMode } from "../../types.js";

import { useDashboardRelatedFilters } from "./hooks/useDashboardRelatedFilters.js";
import { type MetaExportDataAttributes } from "./types.js";
import { useMetaExportData, useMetaExportImageData, useMetaPaletteData } from "./useExportData.js";

/**
 * @alpha
 */
export interface IDefaultDashboardExportVariablesProps {
    renderMode: RenderMode;
}

/**
 * @alpha
 */
export function DefaultDashboardExportVariables({ renderMode }: IDefaultDashboardExportVariablesProps) {
    const run = renderMode === "export";
    const exportData = useMetaExportData();
    const user = useDashboardSelector(selectCurrentUser);
    const conf = useDashboardSelector(selectConfig);
    const dashboardId = useDashboardSelector(selectDashboardId);
    const dashboardDescriptor = useDashboardSelector(selectDashboardDescriptor);
    const { dateFilters, attributeFilters, measureValueFilters, isError, isLoading } =
        useDashboardRelatedFilters(run);
    const parameters = useDashboardSelector(selectActiveTabExportParameters);
    const theme = useTheme();

    if (!run) {
        return null;
    }

    const filterGroups = [
        { kind: "date", items: dateFilters, attrs: exportData?.filters?.dateFilter },
        { kind: "attribute", items: attributeFilters, attrs: exportData?.filters?.attributeFilter },
        { kind: "measureValue", items: measureValueFilters, attrs: exportData?.filters?.measureValueFilter },
    ];
    const hasEntries =
        dateFilters.length + attributeFilters.length + measureValueFilters.length + parameters.length > 0;

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
                {hasEntries ? (
                    <>
                        {filterGroups.flatMap(({ kind, items, attrs }) =>
                            items.map((filter, i: number) => (
                                <div
                                    key={`${kind}-${i}`}
                                    {...attrs}
                                    {...exportData?.filters?.filter.filterData(filter, isLoading, isError)}
                                >
                                    <span {...exportData?.filters?.filter.name}>{filter?.title}</span> -{" "}
                                    <span {...exportData?.filters?.filter.value}>{filter?.subtitle}</span>
                                </div>
                            )),
                        )}
                        {parameters.map((parameter, i: number) => (
                            <div key={`parameter-${i}`} {...exportData?.filters?.parameter}>
                                <span {...exportData?.filters?.filter.name}>{parameter.title}</span> -{" "}
                                <span {...exportData?.filters?.filter.value}>{parameter.value}</span>
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
