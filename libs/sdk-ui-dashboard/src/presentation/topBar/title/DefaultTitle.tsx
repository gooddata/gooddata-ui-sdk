// (C) 2021-2022 GoodData Corporation
import React from "react";

import { TitleWrapper } from "./TitleWrapper.js";
import { CustomTitleComponent } from "./types.js";

/**
 * @alpha
 */
export const DefaultTitle: CustomTitleComponent = (props) => {
    const { title } = props;

    return (
        <TitleWrapper>
            <div className={"s-gd-dashboard-title s-dash-title dash-title static"}>{title}</div>
        </TitleWrapper>
    );
};
