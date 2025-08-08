// (C) 2007-2025 GoodData Corporation
import React, { useEffect, useRef, useMemo } from "react";
import ReactDOM from "react-dom";

export interface IRenderChildrenInPortalProps {
    targetElement: Element;
    children: React.ReactNode;
}

export function RenderChildrenInPortal(props: IRenderChildrenInPortalProps) {
    const portalContentWrapperElRef = useRef<HTMLElement>();

    // Use useMemo to ensure the element is only created once
    const portalElement = useMemo(() => {
        if (!portalContentWrapperElRef.current) {
            portalContentWrapperElRef.current = document.createElement("div");
        }
        return portalContentWrapperElRef.current;
    }, []);

    useEffect(() => {
        if (props.targetElement) {
            props.targetElement.appendChild(portalElement);
        }

        return () => {
            if (props.targetElement && portalElement.parentNode === props.targetElement) {
                props.targetElement.removeChild(portalElement);
            }
        };
    }, [props.targetElement, portalElement]);

    return ReactDOM.createPortal(props.children, portalElement);
}
