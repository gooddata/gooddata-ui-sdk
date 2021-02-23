// (C) 2007-2020 GoodData Corporation
import React, { useMemo } from "react";
import { Col } from "react-grid-system";
import isNil from "lodash/isNil";
import cx from "classnames";
import { IDashboardLayoutItemRenderer } from "./interfaces";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };

export const DashboardLayoutItemRenderer: IDashboardLayoutItemRenderer<unknown> = (props) => {
    const { item, screen, children, className, minHeight = 0, isHidden } = props;
    const size = item.size();
    const currentScreenSizeConfiguration = item.sizeForScreen(screen);
    const ratio = currentScreenSizeConfiguration?.heightAsRatio;
    const width = currentScreenSizeConfiguration?.gridWidth;

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
                },
                className,
            )}
            style={style}
        >
            {children}
        </Col>
    );
};
