// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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

    it("dismisses a focus-triggered tooltip on the first Escape without closing its container", async () => {
        const onContainerEscape = vi.fn();
        render(
            <div
                role="dialog"
                onKeyDown={(event) => {
                    if (event.key === "Escape") {
                        onContainerEscape();
                    }
                }}
            >
                <UiTooltip
                    triggerBy={["focus"]}
                    anchor={<button>anchor</button>}
                    content="content"
                    id="tooltip-id"
                />
            </div>,
        );

        const button = screen.getByRole("button", { name: "anchor" });
        await userEvent.tab();
        expect(button).toHaveFocus();
        expect(await screen.findByRole("tooltip")).toBeInTheDocument();

        await userEvent.keyboard("{Escape}");
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
        expect(onContainerEscape).not.toHaveBeenCalled();
        expect(button).toHaveFocus();

        await userEvent.keyboard("{Escape}");
        expect(onContainerEscape).toHaveBeenCalledTimes(1);
    });

    it("lets a handler inside the anchor take Escape before the tooltip", async () => {
        const onAnchorEscape = vi.fn();
        render(
            <UiTooltip
                triggerBy={["focus"]}
                anchor={
                    <button
                        onKeyDown={(event) => {
                            if (event.key === "Escape") {
                                event.stopPropagation();
                                onAnchorEscape();
                            }
                        }}
                    >
                        anchor
                    </button>
                }
                content="content"
            />,
        );

        await userEvent.tab();
        expect(await screen.findByRole("tooltip")).toBeInTheDocument();

        await userEvent.keyboard("{Escape}");
        expect(onAnchorEscape).toHaveBeenCalledTimes(1);
    });

    it("lets Escape reach the container when a controlled tooltip is open", async () => {
        const onContainerEscape = vi.fn();
        render(
            <div
                onKeyDown={(event) => {
                    if (event.key === "Escape") {
                        onContainerEscape();
                    }
                }}
            >
                <UiTooltip isOpen anchor={<button>anchor</button>} content="content" />
            </div>,
        );

        screen.getByRole("button", { name: "anchor" }).focus();
        await userEvent.keyboard("{Escape}");
        expect(onContainerEscape).toHaveBeenCalledTimes(1);
    });
});
