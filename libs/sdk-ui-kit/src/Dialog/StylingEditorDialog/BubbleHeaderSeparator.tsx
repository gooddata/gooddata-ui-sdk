// (C) 2022 GoodData Corporation

import { Bubble, BubbleHoverTrigger } from "../../Bubble";
import { Typography } from "../../Typography";
import React from "react";

/**
 * @internal
 */
export interface IBubbleHeaderSeparatorProps {
    title?: string;
    message?: string;
}

/**
 * @internal
 */
export const BubbleHeaderSeparator = ({ title, message }: IBubbleHeaderSeparatorProps) => (
    <div className="gd-bubble-header-separator">
        {title && <Typography tagName="h3">{title}</Typography>}
        {message && (
            <BubbleHoverTrigger className="gd-bubble-header-separator-icon" showDelay={0} hideDelay={0}>
                <div className="gd-icon-circle-question" />
                <Bubble
                    className="bubble-primary"
                    arrowOffsets={{ "tc br": [13, -10] }}
                    alignPoints={[{ align: "tc br" }]}
                >
                    {message}
                </Bubble>
            </BubbleHoverTrigger>
        )}
        <div className="gd-bubble-header-separator-divider" />
    </div>
);
