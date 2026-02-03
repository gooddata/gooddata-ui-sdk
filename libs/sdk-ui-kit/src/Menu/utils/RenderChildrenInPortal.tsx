// (C) 2007-2026 GoodData Corporation

import { type ReactNode, useEffect, useMemo, useRef } from "react";

import { createPortal } from "react-dom";

export interface IRenderChildrenInPortalProps {
    targetElement: Element;
    children: ReactNode;
}

export function RenderChildrenInPortal(props: IRenderChildrenInPortalProps) {
    const portalContentWrapperElRef = useRef<HTMLElement | null>(null);

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

    return createPortal(props.children, portalElement);
}
