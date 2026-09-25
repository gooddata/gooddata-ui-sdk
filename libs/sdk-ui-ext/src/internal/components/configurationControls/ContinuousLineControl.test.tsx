// (C) 2019-2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { set } from "lodash-es";
import { describe, expect, it, vi } from "vitest";

import { InternalIntlWrapper } from "../../utils/internalIntlProvider.js";

import { ContinuousLineControl, type IContinuousLineControlProps } from "./ContinuousLineControl.js";

const PAST_TOOLTIP_SHOW_DELAY_MS = 600;

describe("ContinuousLineControl", () => {
    const defaultProps = {
        properties: {},
        propertiesMeta: {},
        pushData: () => {},
    };

    function createComponent(customProps: Partial<IContinuousLineControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return render(
            <InternalIntlWrapper>
                <ContinuousLineControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    it("should render checkbox control", () => {
        createComponent();
        expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("should be unchecked by default", () => {
        createComponent();
        expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("should be enabled by default", () => {
        createComponent();
        expect(screen.getByRole("checkbox")).toBeEnabled();
    });

    it("should render checked checkbox", () => {
        createComponent({ checked: true });
        expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("should render disabled checkbox", () => {
        createComponent({ disabled: true });
        expect(screen.getByRole("checkbox")).toBeDisabled();
    });

    it("should call pushData when checkbox value changes", async () => {
        const pushData = vi.fn();
        createComponent({
            properties: {},
            pushData,
        });

        await userEvent.click(screen.getByRole("checkbox"));
        expect(pushData).toBeCalledWith({ properties: set({}, `controls.continuousLine.enabled`, true) });
    });

    it("should display the tooltip when hovering the label", async () => {
        createComponent();

        await userEvent.hover(screen.getByText("Continuous line"));
        expect(await screen.findByRole("tooltip", { hidden: true })).toHaveTextContent(
            "Draw a line between points with missing values.",
        );
    });

    it("should not display the tooltip when the checkbox is disabled", async () => {
        createComponent({ disabled: true });

        await userEvent.hover(screen.getByText("Continuous line"));
        await new Promise((resolve) => setTimeout(resolve, PAST_TOOLTIP_SHOW_DELAY_MS));
        expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
    });
});
