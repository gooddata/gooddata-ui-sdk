// (C) 2007-2024 GoodData Corporation
import React, { useMemo } from "react";
import cx from "classnames";
import isNil from "lodash/isNil.js";
import { ScreenSize } from "@gooddata/sdk-model";

import { IDashboardLayoutItemFacade } from "../../../_staging/dashboard/fluidLayout/facade/interfaces.js";

import { IDashboardLayoutItemRenderer } from "./interfaces.js";
import { GridLayoutElement } from "./GridLayoutElement.js";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };

export const DashboardLayoutItemViewRenderer: IDashboardLayoutItemRenderer<unknown> = (props) => {
    const { item, screen, children, className, minHeight = 0, isHidden } = props;
    const { ratio, height } = getSizeForItem(item, screen);

    const style = useMemo(() => {
        let computedStyle = {
            minHeight,
        };

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
            type="item"
            screen={screen}
            layoutItemSize={item.size()}
            className={cx(
                {
                    [`s-fluid-layout-column-ratio-${ratio}`]: !isNil(ratio),
                    [`s-fluid-layout-column-height-${height}`]: !isNil(height),
                },
                className,
            )}
            style={style}
        >
            {children}
        </GridLayoutElement>
    );
};

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
