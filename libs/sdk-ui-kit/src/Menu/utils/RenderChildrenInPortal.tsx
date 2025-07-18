// (C) 2007-2025 GoodData Corporation
import { Component, ReactNode } from "react";
import ReactDOM from "react-dom";

export interface IRenderChildrenInPortalProps {
    targetElement: Element;
    children: ReactNode;
}

export class RenderChildrenInPortal extends Component<IRenderChildrenInPortalProps> {
    private portalContentWrapperEl: HTMLElement;

    public constructor(props: IRenderChildrenInPortalProps) {
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
