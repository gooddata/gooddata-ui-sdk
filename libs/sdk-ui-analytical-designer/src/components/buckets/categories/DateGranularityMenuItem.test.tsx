// (C) 2021-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GRANULARITY, GRANULARITY_OPTIONS, type IGranularityOption } from "../../../models/granularity.js";
import { withIntl } from "../../../utils/with_intl.js";
import { withRedux } from "../../../utils/with_redux.js";

import { DateGranularityMenuItem, type IDateGranularityListItemOwnProps } from "./DateGranularityMenuItem.js";

describe("DateGranularityListItem", () => {
    const item: IGranularityOption = {
        label: "week",
        dateType: GRANULARITY.WEEK,
    };

    function create(props: Partial<IDateGranularityListItemOwnProps> = {}) {
        const Wrapped = withIntl(withRedux(DateGranularityMenuItem));
        return render(
            <Wrapped
                item={item}
                selectedGranularity={GRANULARITY.WEEK}
                onGranularityChange={() => {}}
                {...props}
            />,
        );
    }

    it("should have s-class from label", () => {
        const { container } = create();
        expect(container.querySelector(".s-granularity-item")).toHaveClass("s-week");
    });

    it("should have is-selected class active granularity matches the item", () => {
        const { container } = create();
        expect(container.querySelector(".s-granularity-item")).toHaveClass("is-selected");
    });

    it("should not have is-selected class active granularity does not matches the item", () => {
        const { container } = create({ selectedGranularity: GRANULARITY.DATE });
        expect(container.querySelector(".s-granularity-item")).not.toHaveClass("is-selected");
    });

    it("should don't show values preview if non is defined", () => {
        const { container } = create();
        expect(container.querySelectorAll(".s-granularity-preview").length).toBe(0);
    });

    it("should show values preview if defined", () => {
        const item: IGranularityOption = GRANULARITY_OPTIONS.find(
            (granularity) => granularity.dateType === GRANULARITY.MONTH_IN_YEAR,
        );
        const { container } = create({ item });
        fireEvent.click(container.querySelector(".s-granularity-item"));
        expect(container.querySelectorAll(".s-granularity-preview").length).toBe(1);
    });

    it("should trigger onGranularityChange on click", () => {
        const onGranularityChange = vi.fn();
        const { container } = create({ onGranularityChange });
        fireEvent.click(container.querySelector(".s-granularity-item"));

        expect(onGranularityChange).toHaveBeenCalledWith(GRANULARITY.WEEK);
    });
});
