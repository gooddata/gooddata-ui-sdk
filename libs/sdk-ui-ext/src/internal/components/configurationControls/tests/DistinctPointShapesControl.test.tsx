// (C) 2025 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import noop from "lodash/noop.js";
import set from "lodash/set.js";
import { describe, expect, it, vi } from "vitest";

import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";
import DistinctPointShapesControl, {
    IDistinctPointShapesControlProps,
} from "../DistintcPointShapesControl.js";

describe("DistinctPointShapesControl", () => {
    const defaultProps = {
        properties: {},
        pushData: noop,
    };

    function createComponent(customProps: Partial<IDistinctPointShapesControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return render(
            <InternalIntlWrapper>
                <DistinctPointShapesControl {...props} />
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
        expect(pushData).toBeCalledWith({
            properties: set({}, `controls.distinctPointShapes.enabled`, true),
        });
    });

    it("should display the tooltip when checkbox is disabled", async () => {
        const pushData = vi.fn();
        createComponent({
            properties: {},
            pushData,
            disabled: true,
        });

        await userEvent.hover(screen.getByRole("checkbox"));
        expect(document.querySelector(".content").innerHTML).toEqual(
            "Property is not applicable for this configuration of the visualization",
        );
    });
});
