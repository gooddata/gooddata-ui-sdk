// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { stackMeasures, stackToPercent } from "../../actions/properties_actions.js";
import { optionalStackingSelector } from "../../selectors/optional_stacking_selector.js";
import { withIntl } from "../../utils/with_intl.js";

import { OptionalStacking } from "./OptionalStacking.js";

vi.hoisted(() => {
    vi.resetModules();
});

const useSelectorMock = vi.hoisted(() => vi.fn());
const dispatchMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useSelector: (selector: unknown) => useSelectorMock(selector),
        useDispatch: () => dispatchMock,
    };
});

interface IOptionalStackingState {
    isStackMeasuresVisible: boolean;
    isStackToPercentVisible: boolean;
    isStackMeasuresChecked: boolean;
    isStackToPercentChecked: boolean;
    isOptionalStackingDisabled: boolean;
    canStackInPercent: boolean;
    isStackToPercentDisabledByNegativeValues: boolean;
}

describe("OptionalStacking", () => {
    const Wrapped = withIntl(OptionalStacking);

    beforeEach(() => {
        useSelectorMock.mockReset();
        dispatchMock.mockReset();
    });

    function renderComponent(customState: Partial<IOptionalStackingState> = {}) {
        const state: IOptionalStackingState = {
            isStackMeasuresVisible: false,
            isStackToPercentVisible: false,
            isStackMeasuresChecked: false,
            isStackToPercentChecked: false,
            isOptionalStackingDisabled: false,
            canStackInPercent: true,
            isStackToPercentDisabledByNegativeValues: false,
            ...customState,
        };

        useSelectorMock.mockImplementation((selector: unknown) =>
            selector === optionalStackingSelector ? state : undefined,
        );

        return render(<Wrapped />);
    }

    it("should NOT render optional stacking component", () => {
        const { container } = renderComponent();
        expect(container.querySelectorAll(".optional-stacking")).toHaveLength(0);
    });

    it('should render only "stack measures" checkbox', () => {
        const { container } = renderComponent({
            isStackMeasuresVisible: true,
        });
        expect(container.querySelectorAll(".stack-measures")).toHaveLength(1);
        expect(container.querySelectorAll(".stack-to-percent")).toHaveLength(0);
    });

    it('should render only "stack to 100%" checkbox', () => {
        const { container } = renderComponent({
            isStackToPercentVisible: true,
        });
        expect(container.querySelectorAll(".stack-measures")).toHaveLength(0);
        expect(container.querySelectorAll(".stack-to-percent")).toHaveLength(1);
    });

    it("should render 2 checkboxes", () => {
        const { container } = renderComponent({
            isStackMeasuresVisible: true,
            isStackToPercentVisible: true,
        });
        expect(container.querySelectorAll(".stack-measures")).toHaveLength(1);
        expect(container.querySelectorAll(".stack-to-percent")).toHaveLength(1);
    });

    it("should trigger stackingMeasures", () => {
        const { container } = renderComponent({
            isStackMeasuresVisible: true,
        });
        fireEvent.click(container.querySelector(".s-stack-measures"));
        expect(dispatchMock).toHaveBeenCalledWith(stackMeasures(true));
    });

    it("should trigger stackToPercent", () => {
        const { container } = renderComponent({
            isStackMeasuresVisible: true,
            isStackToPercentVisible: true,
            isStackMeasuresChecked: true,
        });
        fireEvent.click(container.querySelector(".s-stack-to-percent"));
        expect(dispatchMock).toHaveBeenCalledWith(stackToPercent(true));
    });

    it("should enable stackToPercent", () => {
        const { container } = renderComponent({
            isStackMeasuresVisible: true,
            isStackToPercentVisible: true,
            isStackMeasuresChecked: true,
            canStackInPercent: true,
        });
        const checkbox = container.querySelector(".s-stack-to-percent");
        expect(checkbox).toBeEnabled();
    });

    it("should not enable stackToPercent", () => {
        const { container } = renderComponent({
            isStackMeasuresVisible: true,
            isStackToPercentVisible: true,
            isStackMeasuresChecked: true,
            canStackInPercent: false,
        });
        const checkbox = container.querySelector(".s-stack-to-percent");
        expect(checkbox).toBeDisabled();
    });
});
