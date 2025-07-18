// (C) 2007-2025 GoodData Corporation
import { ReactNode, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

export interface IRenderChildrenInPortalProps {
    targetElement: Element;
    children: ReactNode;
}

export function RenderChildrenInPortal(props: IRenderChildrenInPortalProps) {
    const portalContentWrapperElRef = useRef<HTMLElement | null>(null);

    if (!portalContentWrapperElRef.current) {
        portalContentWrapperElRef.current = document.createElement("div");
    }

    useEffect(() => {
        if (props.targetElement) {
            props.targetElement.appendChild(portalContentWrapperElRef.current!);
        }

        return () => {
            if (props.targetElement) {
                props.targetElement.removeChild(portalContentWrapperElRef.current!);
            }
        };
    }, [props.targetElement]);

    return ReactDOM.createPortal(props.children, portalContentWrapperElRef.current);
}
