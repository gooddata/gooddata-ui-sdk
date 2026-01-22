// (C) 2007-2026 GoodData Corporation

import { type CSSProperties, type ReactElement, useMemo } from "react";

import cx from "classnames";

import { type IDashboardLayoutWidgetRenderProps } from "./interfaces.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import {
    selectEnableSnapshotExportAccessibility,
    selectIsExport,
} from "../../../model/store/config/configSelectors.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";

export function DashboardLayoutWidgetRenderer({
    item,
    className,
    contentRef,
    isResizedByLayoutSizingStrategy,
    minHeight,
    height,
    allowOverflow,
    children,
}: IDashboardLayoutWidgetRenderProps<any>): ReactElement {
    const isExport = useDashboardSelector(selectIsExport);
    const isSnapshotAccessibilityEnabled = useDashboardSelector(selectEnableSnapshotExportAccessibility);

    const screen = useScreenSize();
    const { heightAsRatio, gridHeight } = item.size()[screen]!;

    const style = useMemo(() => {
        const computedStyle: CSSProperties = {
            minHeight,
            height,
        };

        if (allowOverflow) {
            computedStyle.overflowX = "hidden";
            computedStyle.overflowY = "auto";
        }

        return computedStyle;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [minHeight, height, allowOverflow, heightAsRatio, isResizedByLayoutSizingStrategy]);

    return (
        <div
            ref={contentRef}
            className={cx("gd-fluidlayout-column-container", className, {
                "custom-height": !!gridHeight,
                "gd-fluidlayout-column-container-export": isSnapshotAccessibilityEnabled && isExport,
            })}
            style={style}
        >
            {children}
        </div>
    );
}
