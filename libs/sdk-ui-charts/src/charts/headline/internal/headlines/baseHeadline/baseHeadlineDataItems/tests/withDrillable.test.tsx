// (C) 2023-2025 GoodData Corporation
import React from "react";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";

import { HeadlineElementType, withIntl } from "@gooddata/sdk-ui";

import { IWithDrillableItemProps } from "../../../../interfaces/BaseHeadlines.js";
import { TEST_DATA_ITEM, HEADLINE_ITEM_LINK_SELECTOR } from "../../../../tests/TestData.fixtures.js";
import { IHeadlineDataItem } from "../../../../interfaces/Headlines.js";
import { mockUseBaseHeadline } from "../../tests/BaseHeadlineMock.js";
import { withDrillable } from "../withDrillable.js";

describe("withDrillable", () => {
    const wrappedComponentClassName = "s-wrapped-component-class-name";
    const WrappedComponent = vi.fn().mockReturnValue(<div className={wrappedComponentClassName}></div>);
    const WithDrillableComponent = withDrillable(WrappedComponent);
    const renderWithDrillableComponent = (props: IWithDrillableItemProps) => {
        const WrappedWithDrillableComponent = withIntl(WithDrillableComponent);
        return render(<WrappedWithDrillableComponent {...props} />);
    };

    beforeEach(() => {
        mockUseBaseHeadline();
    });

    afterAll(() => {
        vi.clearAllMocks();
    });

    it("Should render as drillable item", () => {
        const { container } = renderWithDrillableComponent({
            dataItem: { ...TEST_DATA_ITEM, isDrillable: true },
        });
        expect(container.querySelector(HEADLINE_ITEM_LINK_SELECTOR)).toBeInTheDocument();
    });

    it("Should render as un-drillable item", () => {
        const { container } = renderWithDrillableComponent({ dataItem: TEST_DATA_ITEM });
        expect(container.querySelector(HEADLINE_ITEM_LINK_SELECTOR)).not.toBeInTheDocument();
    });

    it("Should render wrapped component", () => {
        renderWithDrillableComponent({ dataItem: TEST_DATA_ITEM });
        expect(WrappedComponent).toHaveBeenCalled();
    });

    it("Should fire drill event when click to drillable item", () => {
        const fireDrillEvent = vi.fn();
        const elementType: HeadlineElementType = "primaryValue";
        const dataItem: IHeadlineDataItem = {
            ...TEST_DATA_ITEM,
            isDrillable: true,
        };

        mockUseBaseHeadline({ fireDrillEvent });
        const { container } = renderWithDrillableComponent({ dataItem, elementType });

        const drillLink = container.querySelector(HEADLINE_ITEM_LINK_SELECTOR);
        fireEvent.click(drillLink);

        expect(fireDrillEvent).toHaveBeenCalledWith(dataItem, elementType, expect.anything());
    });

    it("should not produce any event upon click when fire handler but data item is not drillable", () => {
        const fireDrillEvent = vi.fn();
        const elementType: HeadlineElementType = "primaryValue";

        mockUseBaseHeadline({ fireDrillEvent });
        const { container } = renderWithDrillableComponent({ dataItem: TEST_DATA_ITEM, elementType });

        fireEvent.click(container.querySelector(`.${wrappedComponentClassName}`));

        expect(fireDrillEvent).not.toHaveBeenCalled();
    });
});
