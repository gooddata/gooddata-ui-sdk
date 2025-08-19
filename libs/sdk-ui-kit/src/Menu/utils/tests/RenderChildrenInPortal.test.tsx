// (C) 2007-2025 GoodData Corporation
import React, { useEffect, useRef } from "react";

import { render, screen } from "@testing-library/react";
import ReactDOM from "react-dom";
import { describe, expect, it } from "vitest";

import { IRenderChildrenInPortalProps } from "../RenderChildrenInPortal.js";

function MockedRenderChildrenInPortal({ targetElement }: IRenderChildrenInPortalProps) {
    const portalNodeRef = useRef<HTMLElement>();

    if (!portalNodeRef.current) {
        portalNodeRef.current = document.createElement("div");
    }

    useEffect(() => {
        const portalNode = portalNodeRef.current!;
        targetElement.appendChild(portalNode);

        return () => {
            portalNode.parentNode?.removeChild(portalNode);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return ReactDOM.createPortal(<div className="child-element">Child Element</div>, portalNodeRef.current);
}

const renderMockedPortal = () => {
    // eslint-disable-next-line react/no-children-prop
    return render(<MockedRenderChildrenInPortal targetElement={document.body} children={null} />);
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
