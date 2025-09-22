// (C) 2019-2025 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { set } from "lodash-es";
import { describe, expect, it, vi } from "vitest";

import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";
import ContinuousLineControl, { IContinuousLineControlProps } from "../ContinuousLineControl.js";

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

    it("should display the tooltip when hovering to the checkbox", async () => {
        const pushData = vi.fn();
        createComponent({
            properties: {},
            pushData,
        });

        await userEvent.hover(screen.getByRole("checkbox"));
        expect(document.querySelector(".content").innerHTML).toEqual(
            "Draw a line between points with missing values.",
        );
    });
});
