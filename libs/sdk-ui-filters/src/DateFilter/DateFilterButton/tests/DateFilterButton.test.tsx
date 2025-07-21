// (C) 2023-2025 GoodData Corporation
import { render } from "@testing-library/react";
import { DateFilterButton } from "../DateFilterButton.js";
import { IFilterButtonCustomIcon } from "../../../shared/index.js";
import { describe, it, expect, vi } from "vitest";

/**
 * Mock FilterButtonCustomIcon to prevent test hangs after React 19 upgrade.
 * The component uses BubbleHoverTrigger + Bubble internally which cause hangs in JSDOM.
 * This mock provides the same structure for testing without complex interactions.
 */
vi.mock("../../../shared/index.js", async () => {
    const actual = await vi.importActual("../../../shared/index.js");
    return {
        ...actual,
        FilterButtonCustomIcon: ({ customIcon }: { customIcon?: IFilterButtonCustomIcon }) =>
            customIcon ? (
                <div className="s-gd-filter-button-custom-icon-wrapper gd-icon-wrapper">
                    <span className="gd-icon">{customIcon.icon}</span>
                </div>
            ) : null,
    };
});

describe("DateFilterButton", () => {
    const renderComponent = (params: { customIcon?: IFilterButtonCustomIcon } = {}) => {
        const defaultProps = {
            title: "Date filter",
            isMobile: false,
            ...params,
        };

        return render(<DateFilterButton {...defaultProps} />);
    };

    it("should render custom icon", () => {
        const customIcon = {
            icon: "icon",
            tooltip: "tooltip",
        };

        renderComponent({ customIcon });
        const iconWrapper = document.querySelector(".s-gd-filter-button-custom-icon-wrapper");
        expect(iconWrapper).toBeTruthy();
        expect(iconWrapper?.querySelector(".gd-icon")?.textContent).toBe("icon");
    });
});
