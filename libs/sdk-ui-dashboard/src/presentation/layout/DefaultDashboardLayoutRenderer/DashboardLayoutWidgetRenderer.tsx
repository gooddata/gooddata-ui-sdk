// (C) 2007-2025 GoodData Corporation
import React, { CSSProperties, ReactElement, useMemo } from "react";
import cx from "classnames";
import { IDashboardLayoutWidgetRenderProps } from "./interfaces.js";
import {
    selectEnableSnapshotExportAccessibility,
    selectIsExport,
    useDashboardSelector,
} from "../../../model/index.js";

export function DashboardLayoutWidgetRenderer(props: IDashboardLayoutWidgetRenderProps<any>): ReactElement {
    const {
        item,
        screen,
        debug,
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

        if (debug) {
            if (!heightAsRatio) {
                computedStyle.outline = "solid 1px yellow";
            } else {
                computedStyle.border = isResizedByLayoutSizingStrategy
                    ? "dashed 1px #d6d6d6"
                    : "solid 1px green";
            }
        }

        return computedStyle;
    }, [minHeight, height, allowOverflow, debug, heightAsRatio, isResizedByLayoutSizingStrategy]);

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
