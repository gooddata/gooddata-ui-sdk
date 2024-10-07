// (C) 2024 GoodData Corporation

import React from "react";
import { ErrorContents } from "../../../model.js";
import { Typography } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

export type ErrorContentsProps = {
    content: ErrorContents;
};

export const ErrorContentsComponent: React.FC<ErrorContentsProps> = ({ content }) => {
    const className = cx("gd-gen-ai-chat__messages__content", "gd-gen-ai-chat__messages__content--error");

    return (
        <Typography tagName="p" className={className}>
            {content.text}
        </Typography>
    );
};
