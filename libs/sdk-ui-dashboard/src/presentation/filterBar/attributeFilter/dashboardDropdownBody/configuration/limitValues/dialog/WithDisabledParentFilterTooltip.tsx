// (C) 2024-2025 GoodData Corporation

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { ReactNode } from "react";

const ALIGN_POINTS = [{ align: "bc tl" }, { align: "tc bl" }];

const ARROW_OFFSET = {
    "bc tl": [-60, 10],
    "tc bl": [-60, -10],
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
}
