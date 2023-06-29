// (C) 2007-2022 GoodData Corporation
import { ScreenSize } from "@gooddata/sdk-model";
import cx from "classnames";
import isNil from "lodash/isNil.js";
import React, { useMemo } from "react";
import { Col } from "react-grid-system";
import { IDashboardLayoutItemRenderer } from "./interfaces.js";
import { IDashboardLayoutItemFacade } from "../../../_staging/dashboard/fluidLayout/facade/interfaces.js";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };

export const DashboardLayoutItemViewRenderer: IDashboardLayoutItemRenderer<unknown> = (props) => {
    const { item, screen, children, className, minHeight = 0, isHidden } = props;
    const { size, ratio, width, height } = getSizeForItem(item, screen);

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
        <Col
            xl={size?.xl?.gridWidth}
            lg={size?.lg?.gridWidth}
            md={size?.md?.gridWidth}
            sm={size?.sm?.gridWidth}
            xs={size?.xs?.gridWidth}
            className={cx(
                "gd-fluidlayout-column",
                "s-fluid-layout-column",
                `s-fluid-layout-screen-${screen}`,
                `s-fluid-layout-column-width-${width}`,
                {
                    [`s-fluid-layout-column-ratio-${ratio}`]: !isNil(ratio),
                    [`s-fluid-layout-column-height-${height}`]: !isNil(height),
                },
                className,
            )}
            style={style}
        >
            {children}
        </Col>
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
