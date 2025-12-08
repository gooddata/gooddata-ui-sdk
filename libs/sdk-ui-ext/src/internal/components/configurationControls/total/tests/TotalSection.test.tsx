// (C) 2023-2025 GoodData Corporation

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import { ITotalSectionProps, TotalSection } from "../TotalSection.js";

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

    it("should render disabled checkbox if there is any metric as total metric", async () => {
        createComponent({ properties: { controls: { total: { measures: ["measure_id"] } } } });
        expect(screen.getByRole("checkbox")).toBeDisabled();
        expect(screen.getByRole("textbox")).toBeDisabled();

        fireEvent.mouseOver(screen.getByRole("checkbox"));

        await waitFor(() =>
            expect(
                screen.getByText(
                    "Disable “is total” options in metric to add sum of all values as a column at the end.",
                ),
            ).toBeInTheDocument(),
        );
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
