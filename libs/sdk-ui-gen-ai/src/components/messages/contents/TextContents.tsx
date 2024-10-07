// (C) 2024 GoodData Corporation

import React from "react";
import { TextContents } from "../../../model.js";
import { Typography } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

export type TextContentsProps = {
    content: TextContents;
};

export const TextContentsComponent: React.FC<TextContentsProps> = ({ content }) => {
    const className = cx("gd-gen-ai-chat__messages__content", "gd-gen-ai-chat__messages__content--text");

    return (
        <Typography tagName="p" className={className}>
            {content.text}
        </Typography>
    );
};
