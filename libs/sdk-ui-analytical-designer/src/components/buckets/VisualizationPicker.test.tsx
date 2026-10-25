// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { defaultVisualizationClasses } from "../../tests/constants.test.helpers.js";
import { withIntl } from "../../utils/with_intl.js";

import { VisualizationPicker } from "./VisualizationPicker.js";

describe("VisualizationPicker", () => {
    const visualizationClasses = defaultVisualizationClasses.slice(0, 2);
    const defaultProps = {
        visualizationClasses,
        selected: defaultVisualizationClasses[1],
        onClick: () => {},
    };

    function renderPicker(customProps = {}) {
        const props = {
            ...defaultProps,
            ...customProps,
        };

        const WrappedPicker = withIntl(VisualizationPicker);

        return render(<WrappedPicker {...props} />);
    }

    it("renders types", () => {
        const { container } = renderPicker();
        const allButtonsLength = container.querySelectorAll("span.vis").length;
        const fakeButtonsLength = container.querySelectorAll("span.vis-fake").length;
        const realButtonsLength = allButtonsLength - fakeButtonsLength;

        expect(realButtonsLength).toEqual(2);

        expect(container.querySelectorAll("button.gd-vis-type-table")).toHaveLength(1);
        expect(container.querySelectorAll("button.gd-vis-type-column")).toHaveLength(1);
    });

    it("sets is-selected class on selected type", () => {
        const { container } = renderPicker();
        const selected = container.querySelector(".is-selected");
        const column = container.querySelector(".gd-vis-type-column");

        expect(selected).toEqual(column);
    });

    it("calls given callback on click", () => {
        const onClick = vi.fn();
        const { container } = renderPicker({ onClick });
        fireEvent.click(container.querySelector(".s-vis-button-table"));
        expect(onClick).toHaveBeenCalledWith(defaultVisualizationClasses[0]);
    });

    it("does not call callback if nothing changed", () => {
        const onClick = vi.fn();
        const { container } = renderPicker({ onClick });
        fireEvent.click(container.querySelector(".s-vis-button-column"));
        expect(onClick).not.toHaveBeenCalled();
    });

    it("should fill the last row with fake buttons", () => {
        const { container } = renderPicker();
        expect(container.querySelectorAll(".vis-fake")).toHaveLength(2);
    });
});
