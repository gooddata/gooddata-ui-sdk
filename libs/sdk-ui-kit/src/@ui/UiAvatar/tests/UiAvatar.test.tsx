// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UiAvatar } from "../UiAvatar.js";

describe("UiAvatar", () => {
    it("renders the requested icon with the supplied accessibility label", () => {
        render(<UiAvatar icon="user" accessibilityConfig={{ ariaLabel: "Marek" }} />);
        expect(screen.getByRole("img", { name: "Marek" })).toBeInTheDocument();
    });

    it("applies the size via CSS var and matches the default 14/32 icon ratio", () => {
        render(
            <UiAvatar
                icon="user"
                size={48}
                accessibilityConfig={{ ariaLabel: "Big avatar" }}
                dataTestId="avatar"
            />,
        );
        const root = screen.getByTestId("avatar");
        expect(root.style.getPropertyValue("--gd-avatar-size")).toBe("48px");
        // 48 * 0.44 = 21.12 -> 21
        const svg = root.querySelector("svg")!;
        expect(svg.getAttribute("width")).toBe("21");
    });

    it("respects explicit iconSize", () => {
        render(
            <UiAvatar
                icon="user"
                size={48}
                iconSize={20}
                accessibilityConfig={{ ariaLabel: "Custom" }}
                dataTestId="avatar"
            />,
        );
        const svg = screen.getByTestId("avatar").querySelector("svg")!;
        expect(svg.getAttribute("width")).toBe("20");
    });

    it("applies the background BEM modifier for the supplied color", () => {
        render(
            <UiAvatar
                icon="user"
                backgroundColor="primary"
                accessibilityConfig={{ ariaLabel: "Primary" }}
                dataTestId="avatar"
            />,
        );
        expect(screen.getByTestId("avatar").className).toContain("gd-ui-kit-avatar--background-primary");
    });

    it("forwards dataTestId to the root element", () => {
        render(<UiAvatar icon="user" accessibilityConfig={{ ariaLabel: "x" }} dataTestId="my-avatar" />);
        expect(screen.getByTestId("my-avatar")).toBeInTheDocument();
    });

    it("hides the icon from assistive tech when ariaHidden is set (decorative avatar)", () => {
        render(<UiAvatar icon="user" accessibilityConfig={{ ariaHidden: true }} dataTestId="avatar" />);
        const svg = screen.getByTestId("avatar").querySelector("svg")!;
        expect(svg.getAttribute("aria-hidden")).toBe("true");
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
});
