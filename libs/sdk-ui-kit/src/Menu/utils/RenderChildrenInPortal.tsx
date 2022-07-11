// (C) 2007-2022 GoodData Corporation
import React from "react";
import ReactDOM from "react-dom";

export interface IRenderChildrenInPortalProps {
    targetElement: Element;
    children: React.ReactNode;
}

export class RenderChildrenInPortal extends React.Component<IRenderChildrenInPortalProps> {
    private portalContentWrapperEl: HTMLElement;

    private constructor(props: IRenderChildrenInPortalProps) {
        super(props);

        this.portalContentWrapperEl = document.createElement("div");
    }

    public UNSAFE_componentWillMount(): void {
        if (this.props.targetElement) {
            this.props.targetElement.appendChild(this.portalContentWrapperEl);
        }
    }

    public componentWillUnmount(): void {
        if (this.props.targetElement) {
            this.props.targetElement.removeChild(this.portalContentWrapperEl);
        }
    }

    public render() {
        return ReactDOM.createPortal(this.props.children, this.portalContentWrapperEl);
    }
}
