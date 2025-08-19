// (C) 2025 GoodData Corporation

import React, { createRef } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UiButton } from "../../UiButton/UiButton.js";
import { UiButtonSegmentedControl } from "../UiButtonSegmentedControl.js";

describe("UiButtonSegmentedControl", () => {
    it("renders wrapper and children", () => {
        render(
            <UiButtonSegmentedControl>
                <UiButton label="Left" />
                <UiButton label="Center" />
                <UiButton label="Right" />
            </UiButtonSegmentedControl>,
        );

        const wrapper = document.querySelector(".gd-ui-kit-button-segmented-control");
        expect(wrapper).not.toBeNull();

        expect(screen.getByText("Left")).toBeInTheDocument();
        expect(screen.getByText("Center")).toBeInTheDocument();
        expect(screen.getByText("Right")).toBeInTheDocument();
    });

    it("forwards ref to the underlying div", () => {
        const ref = createRef<HTMLDivElement>();
        render(
            <UiButtonSegmentedControl ref={ref}>
                <UiButton label="A" />
            </UiButtonSegmentedControl>,
        );

        expect(ref.current).not.toBeNull();
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
});
