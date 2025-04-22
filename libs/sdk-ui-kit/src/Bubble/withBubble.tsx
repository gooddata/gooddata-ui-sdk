// (C) 2023-2025 GoodData Corporation

import { Bubble } from "./Bubble.js";
import { BubbleHoverTrigger } from "./BubbleHoverTrigger.js";
import React, { ReactNode, forwardRef } from "react";
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
    const ResultComponent = forwardRef<any, T & IWithBubbleProps>((props, ref) => {
        const {
            showBubble = true,
            alignPoints = [{ align: "cr cl" }],
            bubbleTextId,
            triggerClassName,
            ...wrappedComponentProps
        } = props;

        const intl = useIntl();

        if (!showBubble || !bubbleTextId) {
            return <WrappedComponent {...props} ref={ref} />;
        }
        const bubbleText = intl.formatMessage(
            { id: bubbleTextId },
            { strong: (chunks: ReactNode) => <strong>{chunks}</strong> },
        );

        return (
            <BubbleHoverTrigger className={triggerClassName}>
                <WrappedComponent {...(wrappedComponentProps as T)} ref={ref} />
                <Bubble alignPoints={alignPoints}>
                    <div>{bubbleText}</div>
                </Bubble>
            </BubbleHoverTrigger>
        );
    });

    ResultComponent.displayName = `withBubble(${
        WrappedComponent.displayName || WrappedComponent.name || "Component"
    })`;

    return ResultComponent;
}
