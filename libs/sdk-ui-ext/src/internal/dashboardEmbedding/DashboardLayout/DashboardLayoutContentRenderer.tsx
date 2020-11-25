// (C) 2007-2020 GoodData Corporation
import React, { CSSProperties } from "react";
import cx from "classnames";
import { IDashboardViewLayoutContentRenderer } from "./interfaces/dashboardLayoutComponents";
import {
    getDashboardLayoutContentHeightForRatioAndScreen,
    getDashboardLayoutMinimumWidgetHeight,
} from "./utils/sizing";

export const DashboardLayoutContentRenderer: IDashboardViewLayoutContentRenderer = (props) => {
    const {
        style,
        debug,
        className,
        column,
        screen,
        layoutContentRef,
        // Keep only html props
        row: _row,
        columnIndex: _columnIndex,
        rowIndex: _rowIndex,
        ...otherProps
    } = props;
    const { content } = column;

    const { heightAsRatio, widthAsGridColumnsCount } = column.size[screen];

    const isResizedByLayout = content?.type === "widget" && content?.resizedByLayout;

    const updatedStyle = React.useMemo(() => {
        let addedStyle: CSSProperties = {};

        // Render content without ratio
        if (!heightAsRatio) {
            const debugStyle = debug ? { outline: "solid 1px yellow" } : {};
            addedStyle = {
                minHeight:
                    content?.type === "widget"
                        ? getDashboardLayoutMinimumWidgetHeight(content?.widgetClass)
                        : 0,
                ...debugStyle,
            };
        } else {
            // Render content with ratio
            const baseDebugStyle = isResizedByLayout
                ? { border: "dashed 1px #d6d6d6" }
                : { border: "solid 1px green" };
            const debugStyle = debug ? baseDebugStyle : {};
            addedStyle = {
                ...debugStyle,
                height: getDashboardLayoutContentHeightForRatioAndScreen(
                    heightAsRatio,
                    widthAsGridColumnsCount,
                    screen,
                ),
                overflowY: "auto",
                overflowX: "hidden",
            };
        }

        return {
            ...addedStyle,
            ...style,
        };
    }, [style, heightAsRatio, debug, widthAsGridColumnsCount, screen, isResizedByLayout]);

    return (
        <div
            {...otherProps}
            ref={layoutContentRef}
            className={cx("gd-fluidlayout-column-container", className)}
            style={updatedStyle}
        />
    );
};
