// (C) 2007-2025 GoodData Corporation

import { CSSProperties, ReactElement, useMemo } from "react";

import cx from "classnames";

import { IDashboardLayoutWidgetRenderProps } from "./interfaces.js";
import {
    selectEnableSnapshotExportAccessibility,
    selectIsExport,
    useDashboardSelector,
} from "../../../model/index.js";
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
