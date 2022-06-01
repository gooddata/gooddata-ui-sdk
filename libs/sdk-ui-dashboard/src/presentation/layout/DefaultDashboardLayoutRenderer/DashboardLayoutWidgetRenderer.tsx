// (C) 2007-2022 GoodData Corporation
import React, { CSSProperties } from "react";
import cx from "classnames";
import { IDashboardLayoutWidgetRenderProps } from "./interfaces";

export function DashboardLayoutWidgetRenderer(props: IDashboardLayoutWidgetRenderProps<any>): JSX.Element {
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

    const { heightAsRatio, gridHeight } = item.size()[screen]!;

    const style = React.useMemo(() => {
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

    const getClassNames = () => {
        return cx("gd-fluidlayout-column-container", className, {
            "custom-height": !!gridHeight,
        });
    };

    return (
        <div ref={contentRef} className={getClassNames()} style={style}>
            {children}
        </div>
    );
}
