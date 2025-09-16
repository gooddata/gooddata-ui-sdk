// (C) 2019-2025 GoodData Corporation

import { ReactNode, useEffect, useRef } from "react";

import { ObjRef } from "@gooddata/sdk-model";

import { HoveredWidgetContext } from "../../../dragAndDrop/index.js";

interface HoverDetectorProps {
    widgetRef: ObjRef;
    children?: ReactNode;
}

export function HoverDetector({ widgetRef, children }: HoverDetectorProps) {
    const { addHoveredWidget, removeHoveredWidget } = HoveredWidgetContext.useContextStore((ctx) => ({
        addHoveredWidget: ctx.addHoveredWidget,
        removeHoveredWidget: ctx.removeHoveredWidget,
    }));
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseEnter = () => {
            addHoveredWidget(widgetRef);
        };
        const handleMouseLeave = () => {
            removeHoveredWidget(widgetRef);
        };

        const divElement = divRef.current;
        if (divElement) {
            divElement.addEventListener("mouseenter", handleMouseEnter);
            divElement.addEventListener("mouseleave", handleMouseLeave);
        }

        return () => {
            removeHoveredWidget(widgetRef);

            if (divElement) {
                divElement.removeEventListener("mouseenter", handleMouseEnter);
                divElement.removeEventListener("mouseleave", handleMouseLeave);
            }
        };
    }, [addHoveredWidget, removeHoveredWidget, widgetRef]);

    return (
        <div ref={divRef} className="gd-hover-detector">
            {children}
        </div>
    );
}
