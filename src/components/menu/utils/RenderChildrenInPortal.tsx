// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import * as ReactDOM from "react-dom";

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

    public componentWillMount() {
        if (this.props.targetElement) {
            this.props.targetElement.appendChild(this.portalContentWrapperEl);
        }
    }

    public componentWillUnmount() {
        if (this.props.targetElement) {
            this.props.targetElement.removeChild(this.portalContentWrapperEl);
        }
    }

    public render() {
        return ReactDOM.createPortal(this.props.children, this.portalContentWrapperEl);
    }
}
