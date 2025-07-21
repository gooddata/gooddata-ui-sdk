// (C) 2020-2025 GoodData Corporation
import { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import noop from "lodash/noop.js";
import { IRankingFilterProps, RankingFilter } from "../RankingFilter.js";
import { describe, it, expect, vi } from "vitest";

/**
 * Mock BubbleHoverTrigger and Bubble to prevent test hangs after React 19 upgrade.
 * RankingFilter uses these components for tooltips throughout the component hierarchy,
 * but the complex DOM event handling and positioning logic causes hangs in JSDOM test environment.
 */
vi.mock("@gooddata/sdk-ui-kit", async () => {
    const actual = await vi.importActual("@gooddata/sdk-ui-kit");
    return {
        ...actual,
        BubbleHoverTrigger: ({ children }: { children: ReactNode }) => (
            <div className="gd-bubble-trigger">{children}</div>
        ),
        Bubble: ({ className }: { children?: ReactNode; className?: string }) => (
            <div className={`gd-bubble ${className || ""}`} style={{ display: "none" }} />
        ),
    };
});

import * as Mock from "./mocks.js";

const DROPDOWN_BODY = ".s-rf-dropdown-body";

const renderComponent = (props?: Partial<IRankingFilterProps>) => {
    const defaultProps: IRankingFilterProps = {
        measureItems: Mock.measureItems,
        attributeItems: Mock.attributeItems,
        filter: Mock.defaultFilter,
        onApply: noop,
        onCancel: noop,
        buttonTitle: "Ranking Filter",
    };
    return render(<RankingFilter {...defaultProps} {...props} />);
};

describe("RankingFilter", () => {
    it("should render a button with provided title", () => {
        renderComponent({ buttonTitle: "My title" });

        expect(screen.getByText("My title")).toBeInTheDocument();
    });

    it("should open and close dropdown on button click", () => {
        renderComponent();

        const button = screen.getByText("Ranking Filter");
        expect(document.querySelector(DROPDOWN_BODY)).not.toBeInTheDocument();

        fireEvent.click(button);
        expect(document.querySelector(DROPDOWN_BODY)).toBeInTheDocument();

        fireEvent.click(button);
        expect(document.querySelector(DROPDOWN_BODY)).not.toBeInTheDocument();
    });
});
