// (C) 2007-2024 GoodData Corporation
import React from "react";

import { IDashboardLayoutSectionRenderer } from "./interfaces.js";
import { GridLayoutElement } from "./GridLayoutElement.js";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };
const defaultStyle = {};

export const DashboardLayoutSectionRenderer: IDashboardLayoutSectionRenderer<unknown> = (props) => {
    const { children, screen, parentLayoutItem, className, isHidden } = props;
    const style = isHidden ? isHiddenStyle : defaultStyle;
    return (
        <GridLayoutElement
            type="section"
            screen={screen}
            sizingLayoutItem={parentLayoutItem}
            className={className}
            style={style}
        >
            {children}
        </GridLayoutElement>
    );
};
