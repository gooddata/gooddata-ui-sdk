// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UiSectionHeading } from "../UiSectionHeading.js";

describe("UiSectionHeading", () => {
    it("renders the label", () => {
        render(<UiSectionHeading label="Shared with" />);
        expect(screen.getByText("Shared with")).toBeInTheDocument();
    });

    it("renders the action when provided", () => {
        render(<UiSectionHeading label="Shared with" action={<button>add</button>} />);
        expect(screen.getByRole("button", { name: "add" })).toBeInTheDocument();
    });

    it("omits the action when not provided", () => {
        const { container } = render(<UiSectionHeading label="Section" />);
        expect(container.querySelector(".gd-ui-kit-section-heading__action")).not.toBeInTheDocument();
    });
});
