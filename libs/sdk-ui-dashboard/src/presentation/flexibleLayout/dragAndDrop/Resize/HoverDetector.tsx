// (C) 2019-2025 GoodData Corporation
import React, { useEffect, useRef } from "react";

import { ObjRef } from "@gooddata/sdk-model";

import { useHoveredWidget } from "../../../dragAndDrop/HoveredWidgetContext.js";

interface HoverDetectorProps {
    widgetRef: ObjRef;
    children?: React.ReactNode;
}

export function HoverDetector({ widgetRef, children }: HoverDetectorProps) {
    const { addHoveredWidget, removeHoveredWidget } = useHoveredWidget();
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
