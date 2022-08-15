// (C) 2007-2022 GoodData Corporation
import React from "react";
import ReactDOM from "react-dom";
import { render, screen } from "@testing-library/react";

import { IRenderChildrenInPortalProps } from "../RenderChildrenInPortal";

class MockedRenderChildrenInPortal extends React.Component {
    portalNode: HTMLElement;
    constructor(props: IRenderChildrenInPortalProps) {
        super(props);

        this.portalNode = document.createElement("div");
    }

    componentDidMount() {
        document.body.appendChild(this.portalNode);
    }

    componentWillUnmount() {
        this.portalNode.parentNode.removeChild(this.portalNode);
    }

    render() {
        return ReactDOM.createPortal(<div className="child-element">Child Element</div>, this.portalNode);
    }
}

const renderMockedPortal = () => {
    return render(<MockedRenderChildrenInPortal />);
};

describe("RenderChildrenInPortal", () => {
    it("should render children in targetElement", async () => {
        renderMockedPortal();

        expect(screen.getByText("Child Element")).toBeInTheDocument();
    });

    it("removes the node from the document when it unmounts", () => {
        const { unmount } = renderMockedPortal();

        expect(screen.getByText("Child Element")).toBeInTheDocument();

        unmount();

        expect(screen.queryByText("Child Element")).not.toBeInTheDocument();
    });
});
