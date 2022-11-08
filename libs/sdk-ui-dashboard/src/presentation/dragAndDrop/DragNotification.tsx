// (C) 2022 GoodData Corporation
import React, { FC, useCallback, useRef } from "react";
import { useDndNotification } from "./useDndNotification";

const fireGoodstrapDragEvent = (
    node: HTMLElement,
    windowInstance = { dispatchEvent: (_event: Event) => true },
) => {
    windowInstance.dispatchEvent(
        new CustomEvent("goodstrap.drag", {
            // this will close dropdowns with closeOnMouseDrag=true
            bubbles: true,
            detail: {
                node,
            },
        }),
    );
};

/**
 * This component listen DnD operation via useDndNotification hook and fires global goodstrap event to close all overlays
 * @internal
 */
export const DragNotification: FC = (props) => {
    const { children } = props;
    const elementRef = useRef<HTMLDivElement>(null);

    const onStartDnd = useCallback(() => {
        if (elementRef.current) {
            fireGoodstrapDragEvent(window.document.body, window);
        }
    }, []);

    useDndNotification({ onStartDnd });

    return <div ref={elementRef}>{children} </div>;
};
