// (C) 2019-2025 GoodData Corporation

import { ReactElement, useMemo, useState } from "react";

import { determineWidthForScreen } from "../../../_staging/layout/sizing.js";
import { useSectionDescriptionExportData } from "../../export/index.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";

import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer.js";
import { IDashboardLayoutSectionHeaderRenderProps } from "./interfaces.js";
import { buildEmptyItemFacadeWithSetSize } from "./utils/emptyFacade.js";
import { DashboardLayoutViewSectionHeader } from "./DashboardLayoutViewSectionHeaderRenderer.js";

export function DashboardLayoutExportSectionHeaderRenderer(
    props: IDashboardLayoutSectionHeaderRenderProps<unknown>,
): ReactElement | null {
    const { section, parentLayoutItemSize } = props;
    const sectionHeader = section.header();
    const screen = useScreenSize();
    const gridWidth = determineWidthForScreen(screen, parentLayoutItemSize);
    const emptyItem = useMemo(() => {
        return buildEmptyItemFacadeWithSetSize(gridWidth, section.index());
    }, [gridWidth, section]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const exportData = useSectionDescriptionExportData(props.exportData, loading, error);

    if (!sectionHeader) {
        return null;
    }
    return (
        <DashboardLayoutItemViewRenderer
            DefaultItemRenderer={DashboardLayoutItemViewRenderer}
            item={emptyItem}
            // header is always at the top, this information is not usable by it but required by
            // the shared interface with widget
            rowIndex={-1}
        >
            <DashboardLayoutViewSectionHeader
                section={section}
                exportData={exportData}
                onLoadingChanged={(loading) => setLoading(loading.isLoading)}
                onError={(error) => setError(!!error)}
            />
        </DashboardLayoutItemViewRenderer>
    );
}
