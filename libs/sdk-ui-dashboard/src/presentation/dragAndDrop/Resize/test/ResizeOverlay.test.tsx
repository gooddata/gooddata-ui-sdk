// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { ResizeOverlayProps, ResizeOverlay } from "../ResizeOverlay.js";
import { IntlWrapper } from "../../../localization/index.js";

const defaultProps: ResizeOverlayProps = {
    isResizingColumnOrRow: false,
    isActive: false,
    reachedWidthLimit: "none",
    reachedHeightLimit: "none",
};

function createComponent(customProps: Partial<ResizeOverlayProps> = {}) {
    const props = { ...defaultProps, ...customProps };
    return render(
        <IntlWrapper>
            <ResizeOverlay {...props} />
        </IntlWrapper>,
    );
}

describe("ResizeOverlay", () => {
    it("should render nothing when not isResizingColumnOrRow", () => {
        createComponent();

        expect(screen.queryByRole("resize-overlay")).not.toBeInTheDocument();
    });

    it("should render overlay when isResizingColumn ", () => {
        createComponent({ isResizingColumnOrRow: true });

        expect(screen.getByRole("resize-overlay")).toBeInTheDocument();
    });

    it("should render overlay with width error description when in error state", () => {
        createComponent({
            isResizingColumnOrRow: true,
            isActive: true,
            reachedWidthLimit: "min",
        });
        expect(screen.getByText("Widget is at the minimal width")).toBeInTheDocument();
    });

    it("should render overlay with height error description when in error state", () => {
        createComponent({
            isResizingColumnOrRow: true,
            isActive: true,
            reachedHeightLimit: "max",
        });
        expect(screen.getByText("Widget is at the maximal height")).toBeInTheDocument();
    });
});
