// (C) 2026 GoodData Corporation

import { type ReactNode, useRef } from "react";

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { render } from "../../../test/render.js";
import { UiToolbar } from "../UiToolbar/UiToolbar.js";
import { UiToolbarButton } from "../UiToolbarButton/UiToolbarButton.js";

import { UiFloatingElement } from "./UiFloatingElement.js";

interface IPageProps {
    isOpen: boolean;
    children?: ReactNode;
}

function Page({ isOpen, children = <button type="button">Inside</button> }: IPageProps) {
    const anchor = useRef<HTMLDivElement>(null);
    return (
        <>
            <button type="button">Before</button>
            <div ref={anchor}>Anchor</div>
            <UiFloatingElement anchor={anchor} isOpen={isOpen}>
                {children}
            </UiFloatingElement>
            <button type="button">After</button>
        </>
    );
}

describe("UiFloatingElement", () => {
    it("keeps its controls in the tab order after the focus leaves it", async () => {
        const { user } = render(<Page isOpen />);
        const inside = screen.getByRole("button", { name: "Inside" });
        inside.focus();
        await user.click(screen.getByRole("button", { name: "Before" }));
        screen.getByRole("button", { name: "After" }).focus();

        await user.tab();

        expect(inside).toHaveFocus();
    });

    it("lets a toolbar inside it keep its roving tab stop while the focus is away", async () => {
        const { user } = render(
            <Page isOpen>
                <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                    <UiToolbarButton label="One" />
                    <UiToolbarButton label="Two" />
                    <UiToolbarButton label="Three" />
                </UiToolbar>
            </Page>,
        );
        const one = screen.getByRole("button", { name: "One" });
        const two = screen.getByRole("button", { name: "Two" });
        const three = screen.getByRole("button", { name: "Three" });
        one.focus();
        await user.keyboard("{ArrowRight}");
        await user.click(screen.getByRole("button", { name: "Before" }));
        screen.getByRole("button", { name: "After" }).focus();

        await user.tab();

        expect(two).toHaveFocus();
        expect(one).toHaveAttribute("tabindex", "-1");
        expect(three).toHaveAttribute("tabindex", "-1");
    });

    it("adds nothing to the tab order while closed", async () => {
        const { user } = render(<Page isOpen={false} />);
        screen.getByRole("button", { name: "Before" }).focus();

        await user.tab();

        expect(screen.queryByRole("button", { name: "Inside" })).toBeNull();
        expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    });
});
