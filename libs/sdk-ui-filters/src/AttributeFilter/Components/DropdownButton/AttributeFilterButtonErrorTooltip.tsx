// (C) 2023 GoodData Corporation
import React from "react";
import { Bubble, BubbleHoverTrigger, IAlignPoint } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";

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
export const AttributeFilterButtonErrorTooltip: React.FC<{
    children: React.ReactNode;
    errorMessage?: string;
}> = ({ children, errorMessage }) => {
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
};
