// (C) 2023-2025 GoodData Corporation
import { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IFilterButtonCustomIcon } from "../../../interfaces/index.js";
import { FilterButtonCustomIcon } from "../FilterButtonCustomIcon.js";

/**
 * Mock BubbleHoverTrigger and Bubble to avoid test hangs after React 19 upgrade.
 *
 * The FilterButtonCustomIcon component uses BubbleHoverTrigger + Bubble components for tooltip functionality.
 * After React 19 upgrade, the complex DOM event handling and positioning logic in BubbleHoverTrigger
 * became incompatible with the JSDOM test environment, causing tests to hang during component initialization.
 *
 * React 19 changed component initialization and effect scheduling, making the async hover logic,
 * DOM positioning calculations, and event handling problematic in tests. This mock provides the same
 * DOM structure for testing without the complex interactions that cause hangs.
 */
vi.mock("@gooddata/sdk-ui-kit", async () => {
    const actual = await vi.importActual("@gooddata/sdk-ui-kit");
    return {
        ...actual,
        BubbleHoverTrigger: ({ children }: { children: ReactNode }) => (
            <div className="gd-bubble-trigger">{children}</div>
        ),
        Bubble: ({ children, className }: { children: ReactNode; className?: string }) => (
            <div className={`gd-bubble ${className || ""}`} style={{ display: "block" }}>
                {children}
            </div>
        ),
    };
});

const CUSTOM_ICON_WRAPPER_SELECTOR = ".s-gd-filter-button-custom-icon-wrapper";
const DISABLED_SELECTOR = ".s-disabled";

describe("FilterButtonCustomIcon", () => {
    const renderCustomIcon = (params?: { customIcon?: IFilterButtonCustomIcon; disabled?: boolean }) => {
        return render(<FilterButtonCustomIcon {...params} />);
    };

    const customIcon: IFilterButtonCustomIcon = {
        icon: "gd-icon-lock",
        tooltip: "This filter is locked, its value cannot be changed outside of edit mode.",
        bubbleClassNames: "bubble-primary",
        bubbleAlignPoints: [{ align: "bc tl", offset: { x: 0, y: 7 } }],
    };

    it("should render custom icon correctly", async () => {
        renderCustomIcon({ customIcon });
        const icon = document.querySelector(`.${customIcon.icon}`);
        expect(icon).toBeInTheDocument();

        fireEvent.mouseOver(document.querySelector(`.${customIcon.icon}`));
        await waitFor(async () => {
            expect(screen.queryByText(customIcon.tooltip)).toBeInTheDocument();
        });
    });

    it("should not render custom icon when customIcon is undefined", () => {
        const { container } = renderCustomIcon();
        expect(container.querySelector(CUSTOM_ICON_WRAPPER_SELECTOR)).toBeFalsy();
    });

    it("should render disabled icon", () => {
        const { container } = renderCustomIcon({ customIcon, disabled: true });
        expect(container.querySelector(DISABLED_SELECTOR)).toBeInTheDocument();
    });

    it("should not render disabled icon", () => {
        const { container } = renderCustomIcon({ customIcon });
        expect(container.querySelector(DISABLED_SELECTOR)).toBeFalsy();
    });
});
