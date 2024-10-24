// (C) 2007-2024 GoodData Corporation
import React, { CSSProperties, useMemo } from "react";
import cx from "classnames";
import { IDashboardLayoutWidgetRenderProps } from "./interfaces.js";

export function DashboardLayoutWidgetRenderer(props: IDashboardLayoutWidgetRenderProps<any>): JSX.Element {
    const {
        item,
        screen,
        className,
        contentRef,
        isResizedByLayoutSizingStrategy,
        minHeight,
        height,
        allowOverflow,
        children,
    } = props;

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
            })}
            style={style}
        >
            {children}
        </div>
    );
}
