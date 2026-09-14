// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UiTooltip } from "./UiTooltip.js";

const MODIFIER = "gd-ui-kit-tooltip--defaultMaxWidth";

function renderTooltip(props: Partial<Parameters<typeof UiTooltip>[0]> = {}) {
    render(<UiTooltip isOpen anchor={<button>anchor</button>} content="content" {...props} />);
    return screen.getByRole(props.accessibilityConfig?.role ?? "tooltip");
}

describe("UiTooltip", () => {
    it("caps the width when the caller sets none", () => {
        expect(renderTooltip()).toHaveClass(MODIFIER);
    });

    it("drops the cap for an explicit pixel width", () => {
        const tooltip = renderTooltip({ width: 480 });
        expect(tooltip).not.toHaveClass(MODIFIER);
        expect(tooltip).toHaveStyle({ width: "480px" });
    });

    it("drops the cap for a width matching the anchor", () => {
        expect(renderTooltip({ width: "same-as-anchor" })).not.toHaveClass(MODIFIER);
    });

    it("drops the cap for popovers, which size themselves", () => {
        expect(renderTooltip({ behaviour: "popover" })).not.toHaveClass(MODIFIER);
    });
});
