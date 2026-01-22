// (C) 2019-2026 GoodData Corporation

import { type ReactElement, useMemo, useState } from "react";

import { isEmpty } from "lodash-es";

import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer.js";
import { DashboardLayoutViewSectionHeader } from "./DashboardLayoutViewSectionHeaderRenderer.js";
import { type IDashboardLayoutSectionHeaderRenderProps } from "./interfaces.js";
import { buildEmptyItemFacadeWithSetSize } from "./utils/emptyFacade.js";
import { determineWidthForScreen } from "../../../_staging/layout/sizing.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";
import { useSectionDescriptionExportData } from "../../export/useExportData.js";

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

    //remove empty section headers; avoid in nested containers as this would delete the first child in some cases
    if (isEmpty(sectionHeader) && !section.index()?.parent) {
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
            {isEmpty(sectionHeader) ? null : (
                <DashboardLayoutViewSectionHeader
                    section={section}
                    exportData={exportData}
                    onLoadingChanged={(loading) => setLoading(loading.isLoading)}
                    onError={(error) => setError(!!error)}
                />
            )}
        </DashboardLayoutItemViewRenderer>
    );
}
