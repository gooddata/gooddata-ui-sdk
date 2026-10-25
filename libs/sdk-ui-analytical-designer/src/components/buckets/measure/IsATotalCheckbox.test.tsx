// (C) 2023-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntl } from "../../../utils/with_intl.js";

import { type IIsATotalCheckboxProps, IsATotalCheckboxBase } from "./IsATotalCheckbox.js";

describe("IsATotalCheckbox", () => {
    const localIdentifier = "id";

    function renderComponent(customProps = {}) {
        const props: IIsATotalCheckboxProps = {
            isTotalMeasureChecked: false,
            isTotalMeasureEnabled: false,
            isTotalMeasureVisible: false,
            localIdentifier,
            onIsATotalMeasureChange: () => {},
            ...customProps,
        };

        const Wrapper = withIntl(IsATotalCheckboxBase);

        return render(<Wrapper {...props} />);
    }

    describe("actions", () => {
        it("should trigger setBucketItemIsTotalMeasure when user clicks the is a total checkbox", () => {
            const onIsATotalMeasureChange = vi.fn();
            renderComponent({
                onIsATotalMeasureChange,
                isTotalMeasureVisible: true,
                isTotalMeasureEnabled: true,
            });
            const checkbox = document.querySelector(".s-is-a-total-measure");

            fireEvent.click(checkbox);
            expect(onIsATotalMeasureChange).toHaveBeenCalledWith(localIdentifier, true);
        });
    });

    describe("Is a total checkbox", () => {
        it("should hide the is a total checkbox", () => {
            renderComponent({ isTotalMeasureVisible: false });
            const checkbox = document.querySelector(".s-is-a-total-measure");

            expect(checkbox).not.toBeInTheDocument();
        });

        it("should show but disable the is a total checkbox", () => {
            renderComponent({ isTotalMeasureVisible: true, isTotalMeasureEnabled: false });
            const checkbox = document.querySelector(".s-is-a-total-measure");

            expect(checkbox).toBeDisabled();
        });

        it("should the is a total checkbox checked", () => {
            renderComponent({
                isTotalMeasureVisible: true,
                isTotalMeasureEnabled: true,
                isTotalMeasureChecked: true,
            });
            const checkbox = document.querySelector(".s-is-a-total-measure");

            expect(checkbox).toBeEnabled();
            expect(checkbox).toBeChecked();
        });
    });
});
