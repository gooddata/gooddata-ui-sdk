// (C) 2023 GoodData Corporation

import { Bubble } from "./Bubble.js";
import { BubbleHoverTrigger } from "./BubbleHoverTrigger.js";
import React from "react";
import { IAlignPoint } from "../typings/positioning.js";
import { useIntl } from "react-intl";

/**
 * @internal
 */
export interface IWithBubbleProps {
    showBubble?: boolean;
    alignPoints?: IAlignPoint[];
    bubbleTextId?: string;
    triggerClassName?: string;
}

/**
 * @internal
 */
export function withBubble<T>(WrappedComponent: React.ComponentType<T>) {
    const ResultComponent: React.FC<T & IWithBubbleProps> = (props) => {
        const {
            showBubble = true,
            alignPoints = [{ align: "cr cl" }],
            bubbleTextId,
            triggerClassName,
            ...wrappedComponentProps
        } = props;

        const intl = useIntl();

        if (!showBubble || !bubbleTextId) {
            return <WrappedComponent {...props} />;
        }
        const bubbleText = intl.formatMessage({ id: bubbleTextId });

        return (
            <BubbleHoverTrigger className={triggerClassName}>
                <WrappedComponent {...(wrappedComponentProps as T)} />
                <Bubble alignPoints={alignPoints}>
                    <div>{bubbleText}</div>
                </Bubble>
            </BubbleHoverTrigger>
        );
    };
    return ResultComponent;
}
