// (C) 2007-2025 GoodData Corporation
import { CSSProperties, useMemo } from "react";
import cx from "classnames";
import { IDashboardLayoutWidgetRenderProps } from "./interfaces.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";
import {
    selectEnableSnapshotExportAccessibility,
    selectIsExport,
    useDashboardSelector,
} from "../../../model/index.js";

export function DashboardLayoutWidgetRenderer(props: IDashboardLayoutWidgetRenderProps<any>) {
    const {
        item,
        className,
        contentRef,
        isResizedByLayoutSizingStrategy,
        minHeight,
        height,
        allowOverflow,
        children,
    } = props;

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
