// (C) 2024 GoodData Corporation

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import React, { ReactNode } from "react";

const ALIGN_POINTS = [{ align: "bc tl" }, { align: "tc bl" }];

const ARROW_OFFSET = {
    "bc tl": [-60, 10],
    "tc bl": [-60, -10],
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
        <BubbleHoverTrigger>
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
