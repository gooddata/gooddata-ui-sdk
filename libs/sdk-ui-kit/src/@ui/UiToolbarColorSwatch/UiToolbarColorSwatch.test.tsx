// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UiToolbarColorSwatch } from "./UiToolbarColorSwatch.js";

describe("UiToolbarColorSwatch", () => {
    it("paints the fill variant with the colour and is decorative", () => {
        const { container } = render(<UiToolbarColorSwatch color="rgb(255, 0, 0)" hasBorder />);

        const root = container.querySelector(".gd-ui-kit-toolbar-color-swatch") as HTMLElement;
        expect(root).toHaveAttribute("aria-hidden", "true");
        expect(root).toHaveClass("gd-ui-kit-toolbar-color-swatch--variant-fill");
        expect(root).toHaveClass("gd-ui-kit-toolbar-color-swatch--hasBorder");
        expect(root.querySelector(".gd-ui-kit-toolbar-color-swatch__fill")).toHaveStyle({
            backgroundColor: "rgb(255, 0, 0)",
        });
        expect(root.querySelector(".gd-ui-kit-toolbar-color-swatch__transparent")).toBeNull();
    });

    it("shows the transparent pattern in the fill, and in the bar of the text variant", () => {
        const { container, rerender } = render(<UiToolbarColorSwatch isTransparent color="rgb(255, 0, 0)" />);
        expect(
            container.querySelector(
                ".gd-ui-kit-toolbar-color-swatch__fill .gd-ui-kit-toolbar-color-swatch__transparent",
            ),
        ).not.toBeNull();
        expect(container.querySelector(".gd-ui-kit-toolbar-color-swatch__fill")).not.toHaveStyle({
            backgroundColor: "rgb(255, 0, 0)",
        });

        rerender(<UiToolbarColorSwatch variant="text" isTransparent color="rgb(255, 0, 0)" />);
        expect(
            container.querySelector(
                ".gd-ui-kit-toolbar-color-swatch__bar .gd-ui-kit-toolbar-color-swatch__transparent",
            ),
        ).not.toBeNull();
        expect(container.querySelector(".gd-ui-kit-toolbar-color-swatch__bar")).not.toHaveStyle({
            backgroundColor: "rgb(255, 0, 0)",
        });
        expect(container.querySelector(".gd-ui-kit-toolbar-color-swatch")).toHaveClass(
            "gd-ui-kit-toolbar-color-swatch--isTransparent",
        );
    });

    // The bar carries the accent when a colour is set, and the checker would otherwise show it
    // through its transparent cells, reading as that colour rather than as no colour.
    it("marks a transparent swatch so the checker does not stand on the accent", () => {
        const { container } = render(<UiToolbarColorSwatch variant="text" isTransparent />);

        expect(container.querySelector(".gd-ui-kit-toolbar-color-swatch")).toHaveClass(
            "gd-ui-kit-toolbar-color-swatch--isTransparent",
        );
    });

    it("renders the text variant with a glyph and a coloured bar", () => {
        const { container } = render(<UiToolbarColorSwatch variant="text" color="blue" glyph="T" />);

        expect(container.querySelector(".gd-ui-kit-toolbar-color-swatch__glyph")).toHaveTextContent("T");
        expect(container.querySelector(".gd-ui-kit-toolbar-color-swatch__bar")).toHaveStyle({
            backgroundColor: "blue",
        });
    });
});
