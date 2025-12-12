// (C) 2007-2025 GoodData Corporation

import { type CSSProperties, useMemo } from "react";

import cx from "classnames";

import { type ScreenSize } from "@gooddata/sdk-model";

import { GridLayoutElement } from "./GridLayoutElement.js";
import { type IDashboardLayoutItemRenderProps } from "./interfaces.js";
import { type IDashboardLayoutItemFacade } from "../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };

export function DashboardLayoutItemViewRenderer({
    item,
    children,
    className,
    minHeight = 0,
    isHidden,
}: IDashboardLayoutItemRenderProps<unknown> & object) {
    const screen = useScreenSize();
    const { ratio, height } = getSizeForItem(item, screen);

    const style = useMemo(() => {
        let computedStyle: CSSProperties = {};

        // Only set minHeight if not zero
        if (minHeight && minHeight > 0) {
            computedStyle.minHeight = minHeight;
        }

        if (isHidden) {
            computedStyle = {
                ...computedStyle,
                ...isHiddenStyle,
            };
        }
        return computedStyle;
    }, [minHeight, isHidden]);

    return (
        <GridLayoutElement
            type={item.isLayoutItem() ? "item" : "leaf-item"}
            layoutItemSize={item.size()}
            className={cx(
                {
                    [`s-fluid-layout-column-ratio-${ratio}`]: !(ratio === null || ratio === undefined),
                    [`s-fluid-layout-column-height-${height}`]: !(height === null || height === undefined),
                },
                className,
            )}
            style={style}
        >
            {children}
        </GridLayoutElement>
    );
}

function getSizeForItem(item: IDashboardLayoutItemFacade<unknown>, screen: ScreenSize) {
    const size = item.size();
    const currentScreenSizeConfiguration = item.sizeForScreen(screen);
    const ratio = currentScreenSizeConfiguration?.heightAsRatio;
    const height = currentScreenSizeConfiguration?.gridHeight;
    const width = currentScreenSizeConfiguration?.gridWidth;

    return {
        height,
        width,
        ratio,
        size,
    };
}
