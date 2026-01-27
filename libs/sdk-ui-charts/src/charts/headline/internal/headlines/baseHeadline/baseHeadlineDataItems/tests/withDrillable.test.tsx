// (C) 2023-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type HeadlineElementType, withIntl } from "@gooddata/sdk-ui";

import {
    type IBaseHeadlineDrillable,
    type IWithDrillableItemProps,
} from "../../../../interfaces/BaseHeadlines.js";
import { type IHeadlineDataItem } from "../../../../interfaces/Headlines.js";
import { HEADLINE_ITEM_LINK_SELECTOR, TEST_DATA_ITEM } from "../../../../tests/TestData.fixtures.js";
import { createMockUseBaseHeadline } from "../../tests/BaseHeadline.test.helpers.js";
import { withDrillable } from "../withDrillable.js";

const useBaseHeadlineMock = vi.hoisted(() => vi.fn());

vi.mock("../../BaseHeadlineContext.js", () => ({
    useBaseHeadline: useBaseHeadlineMock,
}));

const mockUseBaseHeadline = createMockUseBaseHeadline(useBaseHeadlineMock);

describe("withDrillable", () => {
    const wrappedComponentClassName = "s-wrapped-component-class-name";
    const WrappedComponent = vi.fn().mockReturnValue(<div className={wrappedComponentClassName}></div>);
    const WithDrillableComponent = withDrillable(WrappedComponent);
    const renderWithDrillableComponent = (props: IWithDrillableItemProps<IBaseHeadlineDrillable>) => {
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

        const drillLink = container.querySelector(HEADLINE_ITEM_LINK_SELECTOR)!;
        fireEvent.click(drillLink);

        expect(fireDrillEvent).toHaveBeenCalledWith(dataItem, elementType, expect.anything(), undefined);
    });

    it("should not produce any event upon click when fire handler but data item is not drillable", () => {
        const fireDrillEvent = vi.fn();
        const elementType: HeadlineElementType = "primaryValue";

        mockUseBaseHeadline({ fireDrillEvent });
        const { container } = renderWithDrillableComponent({ dataItem: TEST_DATA_ITEM, elementType });

        fireEvent.click(container.querySelector(`.${wrappedComponentClassName}`)!);

        expect(fireDrillEvent).not.toHaveBeenCalled();
    });
});
