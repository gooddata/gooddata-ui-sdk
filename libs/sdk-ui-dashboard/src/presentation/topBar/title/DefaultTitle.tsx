// (C) 2021-2025 GoodData Corporation
import React from "react";

import { TitleWrapper } from "./TitleWrapper.js";
import { CustomTitleComponent } from "./types.js";
import { Typography } from "@gooddata/sdk-ui-kit";

/**
 * @alpha
 */
export const DefaultTitle: CustomTitleComponent = (props) => {
    const { title } = props;

    return (
        <TitleWrapper>
            <Typography tagName="h1" className={"s-gd-dashboard-title s-dash-title dash-title static"}>
                {title}
            </Typography>
        </TitleWrapper>
    );
};
