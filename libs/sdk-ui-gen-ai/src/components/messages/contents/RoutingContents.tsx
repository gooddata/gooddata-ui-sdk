// (C) 2024 GoodData Corporation

import React from "react";
import { RoutingContents } from "../../../model.js";
import { Typography } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

export type RoutingContentsProps = {
    content: RoutingContents;
};

export const RoutingContentsComponent: React.FC<RoutingContentsProps> = ({ content }) => {
    const className = cx("gd-gen-ai-chat__messages__content", "gd-gen-ai-chat__messages__content--routing");

    return (
        <Typography tagName="p" className={className}>
            {content.text}
        </Typography>
    );
};
