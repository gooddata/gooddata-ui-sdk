// (C) 2023-2026 GoodData Corporation

import { act, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import { type ITotalSectionProps, TotalSection } from "../TotalSection.js";

describe("TotalSection", () => {
    const defaultProps: ITotalSectionProps = {
        controlsDisabled: false,
        properties: {
            controls: {
                total: {
                    enabled: true,
                    name: "Total",
                    measures: [],
                },
            },
        },
        propertiesMeta: {
            total_section: {
                collapsed: false,
            },
        },
        pushData: () => {},
    };

    function createComponent(customProps: Partial<ITotalSectionProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return render(
            <InternalIntlWrapper>
                <TotalSection {...props} />
            </InternalIntlWrapper>,
        );
    }

    it("should render Total section", () => {
        createComponent();
        expect(screen.getByText("Total")).toBeInTheDocument();
    });

    it("should be toggle by default", () => {
        createComponent();
        expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("should be enabled the toggle by default", () => {
        createComponent();
        expect(screen.getByRole("checkbox")).toBeEnabled();
    });

    it("should render the input field with the default Total text", () => {
        createComponent();
        expect(screen.getByRole("textbox")).toHaveValue("Total");
    });

    it("should disable the toggle when the controls is disabled", () => {
        createComponent({ controlsDisabled: true });
        expect(screen.getByRole("checkbox")).toBeDisabled();
        expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("should render disabled checkbox if there is any metric as total metric", () => {
        // the disabled message bubble is only shown after BubbleHoverTrigger's SHOW_DELAY (425ms),
        // so use fake timers instead of waiting for the real timeout to elapse
        vi.useFakeTimers();

        try {
            createComponent({ properties: { controls: { total: { measures: ["measure_id"] } } } });
            expect(screen.getByRole("checkbox")).toBeDisabled();
            expect(screen.getByRole("textbox")).toBeDisabled();

            fireEvent.mouseOver(screen.getByRole("checkbox"));
            act(() => {
                vi.runOnlyPendingTimers();
            });

            expect(
                screen.getByText(
                    "Disable “is total” options in metric to add sum of all values as a column at the end.",
                ),
            ).toBeInTheDocument();
        } finally {
            vi.useRealTimers();
        }
    });

    it("should call pushData when the toggle value changes", async () => {
        const pushData = vi.fn();
        createComponent({
            properties: {},
            pushData,
        });
        pushData.mockReset();
        await act(() => userEvent.click(screen.getByRole("checkbox")));
        expect(pushData).toHaveBeenCalledTimes(1);
    });
});
