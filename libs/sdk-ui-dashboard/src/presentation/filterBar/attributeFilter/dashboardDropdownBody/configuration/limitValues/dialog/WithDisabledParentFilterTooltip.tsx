// (C) 2024-2025 GoodData Corporation

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import React, { ReactNode } from "react";

const ALIGN_POINTS = [{ align: "bc tl" }, { align: "tc bl" }];

const ARROW_OFFSET = {
    "bc tl": [-100, 10],
    "tc bl": [-100, -10],
};

interface IWithDisabledFilterTooltipProps {
    children: React.ReactNode;
    isDisabled: boolean;
    formattedMessage: ReactNode;
}

export const WithDisabledParentFilterTooltip: React.FC<IWithDisabledFilterTooltipProps> = ({
    children,
    isDisabled,
    formattedMessage,
}) => {
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
};
