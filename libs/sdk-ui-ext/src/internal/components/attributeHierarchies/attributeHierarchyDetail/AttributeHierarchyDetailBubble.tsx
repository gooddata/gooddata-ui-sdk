// (C) 2023-2025 GoodData Corporation

import { ReactNode } from "react";
import cx from "classnames";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

/**
 *
 * @internal
 */
export interface IAttributeHierarchyDetailBubbleProps {
    className?: string;
    children?: ReactNode;
}

const BUBBLE_ALIGN_POINTS = [
    { align: "cr cl", offset: { x: 15, y: 0 } }, // right
    { align: "cl cr", offset: { x: -15, y: 0 } }, // left
    { align: "tc bc", offset: { x: 0, y: -15 } }, // top
    { align: "bc tc", offset: { x: 0, y: 15 } }, // bottom
];

/**
 *
 * @internal
 */
export function AttributeHierarchyDetailBubble({
    children,
    className,
}: IAttributeHierarchyDetailBubbleProps) {
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
                className="gd-attribute-hierarchy-detail-panel-bubble"
                alignPoints={BUBBLE_ALIGN_POINTS}
                closeOnOutsideClick={true}
                arrowStyle={{ display: "none" }}
            >
                {children}
            </Bubble>
        </BubbleHoverTrigger>
    );
}
