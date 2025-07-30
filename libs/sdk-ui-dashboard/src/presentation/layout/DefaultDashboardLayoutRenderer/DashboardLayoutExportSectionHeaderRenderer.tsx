// (C) 2019-2025 GoodData Corporation
import * as React from "react";
import { ReactElement, useState } from "react";
import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer.js";
import { DashboardLayoutSectionHeader } from "./DashboardLayoutSectionHeader.js";
import { IDashboardLayoutSectionHeaderRenderProps } from "./interfaces.js";
import { emptyItemFacadeWithFullSize } from "./utils/emptyFacade.js";
import { useSectionDescriptionExportData } from "../../export/index.js";

export function DashboardLayoutExportSectionHeaderRenderer(
    props: IDashboardLayoutSectionHeaderRenderProps<any>,
): ReactElement | null {
    const { section, screen } = props;
    const sectionHeader = section.header();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const exportData = useSectionDescriptionExportData(props.exportData, loading, error);

    return sectionHeader ? (
        <DashboardLayoutItemViewRenderer
            DefaultItemRenderer={DashboardLayoutItemViewRenderer}
            item={emptyItemFacadeWithFullSize}
            screen={screen}
        >
            <DashboardLayoutSectionHeader
                title={sectionHeader.title}
                description={sectionHeader.description}
                exportData={exportData}
                onLoadingChanged={(loading) => setLoading(loading.isLoading)}
                onError={(error) => setError(!!error)}
            />
        </DashboardLayoutItemViewRenderer>
    ) : null;
}
