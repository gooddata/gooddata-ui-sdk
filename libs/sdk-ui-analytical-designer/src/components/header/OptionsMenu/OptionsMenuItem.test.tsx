// (C) 2007-2026 GoodData Corporation

import { type ComponentProps } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { withIntl } from "../../../utils/with_intl.js";

import { OptionsMenuItem } from "./OptionsMenuItem.js";

describe("OptionsMenuItem", () => {
    const BUBBLE_CONTENT = "bubble text provided";
    const BUBBLE_ID = "ExportBubble";
    const MENU_ITEM_CLASSNAMES = "s-gd-export-menu-item";
    const MENU_ITEM_BUBBLE_TRIGGER_CLASSNAMES = ".s-gd-bubble-trigger-options-menu-item";
    // mirrors SHOW_DELAY of BubbleHoverTrigger in @gooddata/sdk-ui-kit (not publicly exported)
    const BUBBLE_SHOW_DELAY = 425;

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const Wrapped = withIntl(OptionsMenuItem);

    function renderComponent(customProps: Partial<ComponentProps<typeof Wrapped>> = {}) {
        const defaultProps: ComponentProps<typeof Wrapped> = {
            bubbleId: BUBBLE_ID,
            className: MENU_ITEM_CLASSNAMES,
            titleId: "export.type.XLSX",
            onClick: () => {},
            isDisabled: false,
        };
        const props = { ...defaultProps, ...customProps };
        return render(<Wrapped {...props} />);
    }

    function clickExportMenuItem(container: HTMLElement) {
        const item = container.querySelector(`.${MENU_ITEM_CLASSNAMES}`);
        fireEvent.click(item);
    }

    function hasBubble(container: HTMLElement) {
        return !!container.querySelector(MENU_ITEM_BUBBLE_TRIGGER_CLASSNAMES);
    }

    function hoverBubble(container: HTMLElement) {
        const item = container.querySelector(MENU_ITEM_BUBBLE_TRIGGER_CLASSNAMES);
        fireEvent.mouseOver(item);
    }

    it("should not trigger onClick if menu item is disabled", () => {
        const onClick = vi.fn();
        const { container } = renderComponent({
            bubbleTextProvider: () => BUBBLE_CONTENT,
            isDisabled: true,
            onClick,
        });

        clickExportMenuItem(container);

        expect(onClick).toHaveBeenCalledTimes(0);
    });

    it("should not show bubble by default if button is disabled", () => {
        const { container } = renderComponent({
            isDisabled: true,
        });

        clickExportMenuItem(container);

        expect(hasBubble(container)).toBe(false);
    });

    it("should display bubble if menu item is disabled", () => {
        const { container } = renderComponent({
            bubbleTextProvider: () => BUBBLE_CONTENT,
            isDisabled: true,
        });

        hoverBubble(container);
        act(() => {
            vi.advanceTimersByTime(BUBBLE_SHOW_DELAY);
        });

        expect(hasBubble(container)).toBe(true);
        expect(screen.queryByText(BUBBLE_CONTENT)).toBeInTheDocument();
    });

    it("should trigger onClick menu item is enabled", () => {
        const onClick = vi.fn();
        const { container } = renderComponent({
            isDisabled: false,
            onClick,
        });

        clickExportMenuItem(container);

        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
