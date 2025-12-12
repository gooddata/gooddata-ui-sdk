// (C) 2024-2025 GoodData Corporation

import { type ReactNode } from "react";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

const ALIGN_POINTS = [{ align: "bc tl" }, { align: "tc bl" }];

const ARROW_OFFSET = {
    "bc tl": [-100, 10],
    "tc bl": [-100, -10],
};

interface IWithDisabledFilterTooltipProps {
    children: ReactNode;
    isDisabled: boolean;
    formattedMessage: ReactNode;
}

export function WithDisabledParentFilterTooltip({
    children,
    isDisabled,
    formattedMessage,
}: IWithDisabledFilterTooltipProps) {
    if (!isDisabled) {
        return <>{children}</>;
    }
    return (
        <BubbleHoverTrigger className="gd-attribute-filter-dropdown-tooltip" tagName="div">
            {children}
            <Bubble
                className="bubble-primary gd-attribute-filter-dropdown-bubble s-attribute-filter-dropdown-bubble"
                alignPoints={ALIGN_POINTS}
                arrowOffsets={ARROW_OFFSET}
            >
                {formattedMessage}
            </Bubble>
        </BubbleHoverTrigger>
    );
}
