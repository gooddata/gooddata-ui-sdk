// (C) 2023 GoodData Corporation

import React from "react";
import cx from "classnames";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

/**
 *
 * @alpha
 */
export interface IAttributeHierarchyDetailBubbleProps {
    className?: string;
    children?: React.ReactNode;
}

/**
 *
 * @alpha
 */
export const PANEL_ALIGN_POINTS = [{ align: "cr cl" }];

const ARROW_OFFSETS = { "cr cl": [15, 0] };

/**
 *
 * @alpha
 */
export const AttributeHierarchyDetailBubble: React.FC<IAttributeHierarchyDetailBubbleProps> = (props) => {
    const { children, className } = props;
    return (
        <BubbleHoverTrigger showDelay={0} eventsOnBubble={true}>
            <div
                className={cx(
                    "s-description-trigger",
                    {
                        "gd-icon-circle-question-wrapper": !className,
                    },
                    className,
                )}
            >
                <div className="gd-icon-circle-question" />
            </div>
            <Bubble
                className="bubble-light gd-attribute-hierarchy-detail-panel-bubble"
                alignPoints={PANEL_ALIGN_POINTS}
                arrowOffsets={ARROW_OFFSETS}
                closeOnOutsideClick={true}
            >
                {children}
            </Bubble>
        </BubbleHoverTrigger>
    );
};
