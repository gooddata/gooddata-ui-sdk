// (C) 2007-2018 GoodData Corporation
import React from "react";
import ReactDOM from "react-dom";

export interface IRenderChildrenInPortalProps {
    targetElement: Element;
    children: React.ReactNode;
}

export default class RenderChildrenInPortal extends React.Component<IRenderChildrenInPortalProps> {
    private portalContentWrapperEl: HTMLElement;

    private constructor(props: IRenderChildrenInPortalProps) {
        super(props);

        const wrapperEl = document.createElement("div");
        this.portalContentWrapperEl = wrapperEl;
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

    public render(): React.ReactNode {
        return ReactDOM.createPortal(this.props.children, this.portalContentWrapperEl);
    }
}
