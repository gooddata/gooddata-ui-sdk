// (C) 2023 GoodData Corporation
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider.js";
import CalculationControl from "../CalculationControl.js";
import { CalculationType } from "@gooddata/sdk-ui-charts";
import * as DropdownControl from "../../../DropdownControl.js";
import { IVisualizationProperties } from "../../../../../interfaces/Visualization.js";
import { IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";
import * as CalculationListItem from "../CalculationListItem.js";
import { calculationDropdownItems } from "../../../../../constants/dropdowns.js";
import { createTestProperties } from "../../../../../tests/testDataProvider.js";

const CALCULATION_CONTROL_LABEL_TEXT_QUERY = "Calculated as";
const CHANGE_ITEM_TEXT_QUERY = "Change";
const RATIO_ITEM_TEXT_QUERY = "Ratio";
const DIFFERENCE_ITEM_TEXT_QUERY = "Difference";
const DROPDOWN_BUTTON_SELECTOR = ".button-dropdown";

describe("CalculationControl", () => {
    const mockPushData = vi.fn();

    const renderCalculationControl = (params?: {
        properties?: IVisualizationProperties<IComparisonControlProperties>;
        disabled?: boolean;
    }) => {
        const props = {
            disabled: params?.disabled,
            pushData: mockPushData,
            properties: params?.properties || {},
        };

        return render(
            <InternalIntlWrapper>
                <CalculationControl {...props} />
            </InternalIntlWrapper>,
        );
    };

    it("Should render calculation control based on dropdown-control", () => {
        const MockDropdownControl = vi.spyOn(DropdownControl, "default");
        const disabled = true;
        const properties = createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
                calculationType: CalculationType.CHANGE,
            },
        });

        renderCalculationControl({ properties, disabled: true });
        expect(MockDropdownControl).toHaveBeenCalledWith(
            expect.objectContaining({
                value: properties.controls.comparison.calculationType,
                properties,
                disabled,
                pushData: mockPushData,
                customListItem: CalculationListItem.default,
            }),
            expect.anything(),
        );
    });

    it("Should render label correctly", () => {
        const { getByText } = renderCalculationControl();
        expect(getByText(CALCULATION_CONTROL_LABEL_TEXT_QUERY)).toBeInTheDocument();
    });

    it("Should render items correctly", () => {
        const MockCalculationListItem = vi.spyOn(CalculationListItem, "default");
        const { container } = renderCalculationControl();
        fireEvent.click(container.querySelector(DROPDOWN_BUTTON_SELECTOR));

        expect(MockCalculationListItem).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                info: calculationDropdownItems[0].info,
                icon: calculationDropdownItems[0].icon,
                title: expect.anything(),
            }),
            expect.anything(),
        );
        expect(MockCalculationListItem).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                info: calculationDropdownItems[1].info,
                icon: calculationDropdownItems[1].icon,
                title: expect.anything(),
            }),
            expect.anything(),
        );
        expect(MockCalculationListItem).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                info: calculationDropdownItems[2].info,
                icon: calculationDropdownItems[2].icon,
                title: expect.anything(),
            }),
            expect.anything(),
        );

        expect(screen.getByText(CHANGE_ITEM_TEXT_QUERY)).toBeInTheDocument();
        expect(screen.getByText(RATIO_ITEM_TEXT_QUERY)).toBeInTheDocument();
        expect(screen.getByText(DIFFERENCE_ITEM_TEXT_QUERY)).toBeInTheDocument();
    });

    it("Should update property calculation-type when select an item", () => {
        const { container } = renderCalculationControl({
            properties: createTestProperties<IComparisonControlProperties>({ comparison: { enabled: true } }),
        });
        fireEvent.click(container.querySelector(DROPDOWN_BUTTON_SELECTOR));
        fireEvent.click(screen.getByText(RATIO_ITEM_TEXT_QUERY));
        expect(mockPushData).toHaveBeenCalledWith(
            expect.objectContaining({
                properties: createTestProperties<IComparisonControlProperties>({
                    comparison: { enabled: true, calculationType: CalculationType.RATIO },
                }),
            }),
        );

        fireEvent.click(container.querySelector(DROPDOWN_BUTTON_SELECTOR));
        fireEvent.click(screen.getByText(DIFFERENCE_ITEM_TEXT_QUERY));
        expect(mockPushData).toHaveBeenCalledWith(
            expect.objectContaining({
                properties: createTestProperties<IComparisonControlProperties>({
                    comparison: { enabled: true, calculationType: CalculationType.DIFFERENCE },
                }),
            }),
        );

        fireEvent.click(container.querySelector(DROPDOWN_BUTTON_SELECTOR));
        fireEvent.click(screen.getByText(CHANGE_ITEM_TEXT_QUERY));
        expect(mockPushData).toHaveBeenCalledWith(
            expect.objectContaining({
                properties: createTestProperties<IComparisonControlProperties>({
                    comparison: { enabled: true, calculationType: CalculationType.CHANGE },
                }),
            }),
        );
    });
});
