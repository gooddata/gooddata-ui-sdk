// (C) 2019-2024 GoodData Corporation
import React from "react";
import { ObjRef } from "@gooddata/sdk-model";
import { useHoveredWidget } from "../../../dragAndDrop/HoveredWidgetContext.js";

interface HoverDetectorProps {
    widgetRef: ObjRef;
    children?: React.ReactNode;
}

export const HoverDetector: React.FC<HoverDetectorProps> = ({ widgetRef, children }) => {
    const { setHoveredWidget } = useHoveredWidget();

    return (
        <div
            onMouseOver={() => setHoveredWidget(widgetRef)}
            onMouseOut={() => setHoveredWidget(null)}
            className="gd-hover-detector"
        >
            {children}
        </div>
    );
};
