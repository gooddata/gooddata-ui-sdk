// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { FilterBarService } from "../../../store/filter_bar/filter_bar_service.js";
import { type IDateFilter } from "../../../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../../../store/types.js";
import {
    setupAppStateWithDateDatasetMeta,
    setupAppStateWithDateDatasets,
} from "../../../tests/constants.test.helpers.js";
import { withIntl } from "../../../utils/with_intl.js";
import { withRedux } from "../../../utils/with_redux.js";

import { DateFilterItem, type IDateFilterItemOwnProps } from "./DateFilterItem.js";

describe("DateFilterItem", () => {
    const testDateFilter: IDateFilter = {
        localIdentifier: "localIdentifier987",
        type: "date",
        cacheItemIdentifier: "identifier123",
        overTimeComparisonType: OverTimeComparisonTypes.NOTHING,
        filterConfig: {
            granularity: "GDC.time.month",
            interval: [1, 2],
            type: "relative",
            name: "a date filter",
        },
        dateDatasetRef: {
            identifier: "attr.datedataset.closed",
        },
    };

    function initState(state: IAppState) {
        let newState = setupAppStateWithDateDatasets(state);
        newState = setupAppStateWithDateDatasetMeta(newState);
        newState = FilterBarService.setFilterItems(newState, [testDateFilter]);
        return newState;
    }

    function renderComponent(customProps?: Partial<IDateFilterItemOwnProps>) {
        const defaultProps: IDateFilterItemOwnProps = {
            className: "test-class-name",
            filter: testDateFilter,
        };
        const Wrapped = withRedux(withIntl(DateFilterItem), initState);
        return render(<Wrapped {...defaultProps} {...customProps} />);
    }

    it("should render the element class name based on the local identifier and other class names", () => {
        renderComponent();

        const root = document.querySelector(".s-id-localidentifier987");
        expect(root).toHaveClass("adi-date-filter");
        expect(root).toHaveClass("s-date-filter");
        expect(root).toHaveClass("adi-bucket-item");
        expect(root).toHaveClass("s-bucket-item");
        expect(root).toHaveClass("s-id-localidentifier987");
    });

    it('should have class "highlight" when component receive isHighlighted=true in props', () => {
        renderComponent({ isHighlighted: true });
        expect(document.querySelector(".adi-bucket-item")).toHaveClass("highlight");
    });

    it('should not have class "highlight" when component receive isHighlighted=false in props', () => {
        renderComponent({ isHighlighted: false });
        expect(document.querySelector(".adi-bucket-item")).not.toHaveClass("highlight");
    });
});
