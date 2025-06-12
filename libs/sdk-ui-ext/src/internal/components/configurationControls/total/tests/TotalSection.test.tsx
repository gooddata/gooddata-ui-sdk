// (C) 2023 GoodData Corporation
import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import noop from "lodash/noop.js";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import TotalSection, { ITotalSectionProps } from "../TotalSection.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

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
        pushData: noop,
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
