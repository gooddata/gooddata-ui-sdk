// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LAST_YEAR, THIS_YEAR } from "../constants/presets.js";
import { GRANULARITY } from "../models/granularity.js";
import { createDecoratedPresetItem } from "../models/preset_item.js";
import { withIntl } from "../utils/with_intl.js";

import { DateFilterPresets, type DateFilterPresetsProps } from "./DateFilterPresets.js";

describe("DateFilterPresets", () => {
    const thisYear = createDecoratedPresetItem({
        granularity: GRANULARITY.YEAR,
        interval: ["0", "0"],
        name: THIS_YEAR,
    });
    const lastYear = createDecoratedPresetItem({
        granularity: GRANULARITY.YEAR,
        interval: ["-1", "-1"],
        name: LAST_YEAR,
    });

    const defaultProps: DateFilterPresetsProps = {
        tagName: "div",
        className: "s-presets",
        presets: [thisYear, lastYear],
        onSelectPreset: () => {},
    };

    function renderComponent(props: Partial<DateFilterPresetsProps> = {}) {
        const Wrapped = withIntl(DateFilterPresets);
        return render(<Wrapped {...defaultProps} {...props} />);
    }

    it("should render presets", () => {
        const { container } = renderComponent();
        const metricDateFilterPresets = container.querySelector("div.s-presets");

        expect(metricDateFilterPresets.textContent).toEqual(["This year", "Last year"].join(""));
    });

    it("should call onSelectPreset on preset click", () => {
        const onSelectPreset = vi.fn();
        const props = { onSelectPreset };

        const { container } = renderComponent(props);
        const button = container.querySelector(`.${thisYear.seleniumClass}`);
        fireEvent.click(button);

        expect(onSelectPreset).toHaveBeenCalledTimes(1);
    });

    describe("rendering presets with proper classnames", () => {
        it("should return classname with preset selenium class", () => {
            const { container } = renderComponent();

            expect(container.querySelectorAll(`.${thisYear.seleniumClass}`)).toHaveLength(1);
        });

        it('should return "is-selected" classname when given preset is selected', () => {
            const props = { selectedPreset: thisYear };

            const { container } = renderComponent(props);

            expect(container.querySelectorAll(`div.${thisYear.seleniumClass}.is-selected`)).toHaveLength(1);
        });

        it('should not return "is-selected" classname when given preset is not selected', () => {
            const props = { selectedPreset: lastYear };

            const { container } = renderComponent(props);

            expect(container.querySelectorAll(`.${thisYear.seleniumClass} .is-selected`)).toHaveLength(0);
        });
    });
});
