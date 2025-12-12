// (C) 2023-2025 GoodData Corporation

import { type ReactNode } from "react";

import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger, type IAlignPoint } from "@gooddata/sdk-ui-kit";

const bubbleAlignPoints: IAlignPoint[] = [{ align: "bc tc" }];

/**
 * Tooltip details for the AttributeFilterDropdownButton.
 *
 * @remarks
 * It displays AttributeFilterDropdownButton tooltip details in the GoodData look and feel.
 * It displays the default title, custom title and data set title of the related attribute filter.
 *
 * @beta
 */
export function AttributeFilterButtonErrorTooltip({
    children,
    errorMessage,
}: {
    children: ReactNode;
    errorMessage?: string;
}) {
    return errorMessage ? (
        <div className="gd-attribute-filter-button-wrapper">
            <BubbleHoverTrigger>
                {children}
                <Bubble
                    className="bubble-negative gd-attribute-filter-button-error s-attribute-filter-error-bubble"
                    alignPoints={bubbleAlignPoints}
                >
                    <span>
                        <FormattedMessage id="gs.filter.error.tooltip" />
                    </span>
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    ) : (
        <>{children}</>
    );
}
