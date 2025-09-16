// (C) 2022-2025 GoodData Corporation

import { Bubble, BubbleHoverTrigger } from "../../Bubble/index.js";
import { Typography } from "../../Typography/index.js";

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
export function BubbleHeaderSeparator({ title, message }: IBubbleHeaderSeparatorProps) {
    return (
        <div className="gd-bubble-header-separator">
            {title ? <Typography tagName="h3">{title}</Typography> : null}
            {message ? (
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
            ) : null}
            <div className="gd-bubble-header-separator-divider" />
        </div>
    );
}
