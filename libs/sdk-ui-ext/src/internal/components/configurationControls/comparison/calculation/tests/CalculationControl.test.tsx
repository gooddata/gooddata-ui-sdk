// (C) 2023-2025 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalculateAs, type CalculationType } from "@gooddata/sdk-ui-charts";

import { calculationDropdownItems } from "../../../../../constants/dropdowns.js";
import { type IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";
import { type IVisualizationProperties } from "../../../../../interfaces/Visualization.js";
import { createTestProperties } from "../../../../../tests/testDataProvider.js";
import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider.js";
import * as DropdownControl from "../../../DropdownControl.js";
import { CalculationControl } from "../CalculationControl.js";
import { CalculationListItem } from "../CalculationListItem.js";
import * as CalculationListItemModule from "../CalculationListItem.js";

const CALCULATION_CONTROL_LABEL_TEXT_QUERY = "Calculated as";
const CHANGE_ITEM_TEXT_QUERY = "Change";
const RATIO_ITEM_TEXT_QUERY = "Ratio";
const DIFFERENCE_ITEM_TEXT_QUERY = "Difference";
const CHANGE_DIFFERENCE_ITEM_TEXT_QUERY = "Change (difference)";
const DROPDOWN_BUTTON_SELECTOR = ".button-dropdown";

describe("CalculationControl", () => {
    const mockPushData = vi.fn();

    const renderCalculationControl = (params?: {
        properties?: IVisualizationProperties<IComparisonControlProperties>;
        defaultCalculationType?: CalculationType;
        disabled?: boolean;
    }) => {
        const props = {
            disabled: params?.disabled ?? false,
            defaultCalculationType: params?.defaultCalculationType,
            pushData: mockPushData,
            properties: params?.properties || {},
        };

        return render(
            <InternalIntlWrapper>
                <CalculationControl {...(props as any)} />
            </InternalIntlWrapper>,
        );
    };

    it("Should render calculation control based on dropdown-control", () => {
        const MockDropdownControl = vi.spyOn(DropdownControl, "DropdownControl");
        const disabled = true;
        const properties = createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
                calculationType: CalculateAs.CHANGE,
            },
        });

        renderCalculationControl({ properties, disabled: true });
        expect(MockDropdownControl).toHaveBeenCalledWith(
            expect.objectContaining({
                value: properties.controls!.comparison!.calculationType,
                properties,
                disabled,
                pushData: mockPushData,
                customListItem: CalculationListItem,
            }),
            undefined,
        );
    });

    it("Should select provided calculation-type", () => {
        const { container } = renderCalculationControl({
            defaultCalculationType: CalculateAs.DIFFERENCE,
            properties: createTestProperties<IComparisonControlProperties>({
                comparison: {
                    enabled: true,
                    calculationType: CalculateAs.RATIO,
                },
            }),
        });

        expect(container.querySelector(DROPDOWN_BUTTON_SELECTOR)!.textContent).toEqual(RATIO_ITEM_TEXT_QUERY);
    });

    it("Should select default calculation-type while calculation-type is empty", () => {
        const { container } = renderCalculationControl({
            defaultCalculationType: CalculateAs.DIFFERENCE,
        });
        expect(container.querySelector(DROPDOWN_BUTTON_SELECTOR)!.textContent).toEqual(
            DIFFERENCE_ITEM_TEXT_QUERY,
        );
    });

    it("Should render label correctly", () => {
        const { getByText } = renderCalculationControl();
        expect(getByText(CALCULATION_CONTROL_LABEL_TEXT_QUERY)).toBeInTheDocument();
    });

    it("Should render items correctly", () => {
        const MockCalculationListItem = vi.spyOn(CalculationListItemModule, "CalculationListItem");
        const { container } = renderCalculationControl();
        fireEvent.click(container.querySelector(DROPDOWN_BUTTON_SELECTOR)!);

        expect(MockCalculationListItem).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                info: calculationDropdownItems[0].info,
                icon: calculationDropdownItems[0].icon,
                title: expect.anything(),
            }),
            undefined,
        );
        expect(MockCalculationListItem).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                info: calculationDropdownItems[1].info,
                icon: calculationDropdownItems[1].icon,
                title: expect.anything(),
            }),
            undefined,
        );
        expect(MockCalculationListItem).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                info: calculationDropdownItems[2].info,
                icon: calculationDropdownItems[2].icon,
                title: expect.anything(),
            }),
            undefined,
        );
        expect(MockCalculationListItem).toHaveBeenNthCalledWith(
            4,
            expect.objectContaining({
                info: calculationDropdownItems[3].info,
                icon: calculationDropdownItems[3].icon,
                title: expect.anything(),
            }),
            undefined,
        );

        expect(screen.getByText(CHANGE_ITEM_TEXT_QUERY)).toBeInTheDocument();
        expect(screen.getByText(RATIO_ITEM_TEXT_QUERY)).toBeInTheDocument();
        expect(screen.getByText(DIFFERENCE_ITEM_TEXT_QUERY)).toBeInTheDocument();
        expect(screen.getByText(CHANGE_DIFFERENCE_ITEM_TEXT_QUERY)).toBeInTheDocument();
    });

    it("Should update property calculation-type when select an item", () => {
        const { container } = renderCalculationControl({
            properties: createTestProperties<IComparisonControlProperties>({ comparison: { enabled: true } }),
        });
        fireEvent.click(container.querySelector(DROPDOWN_BUTTON_SELECTOR)!);
        fireEvent.click(screen.getByText(RATIO_ITEM_TEXT_QUERY));
        expect(mockPushData).toHaveBeenCalledWith(
            expect.objectContaining({
                properties: createTestProperties<IComparisonControlProperties>({
                    comparison: { enabled: true, calculationType: CalculateAs.RATIO },
                }),
            }),
        );

        fireEvent.click(container.querySelector(DROPDOWN_BUTTON_SELECTOR)!);
        fireEvent.click(screen.getByText(DIFFERENCE_ITEM_TEXT_QUERY));
        expect(mockPushData).toHaveBeenCalledWith(
            expect.objectContaining({
                properties: createTestProperties<IComparisonControlProperties>({
                    comparison: { enabled: true, calculationType: CalculateAs.DIFFERENCE },
                }),
            }),
        );

        fireEvent.click(container.querySelector(DROPDOWN_BUTTON_SELECTOR)!);
        fireEvent.click(screen.getByText(CHANGE_ITEM_TEXT_QUERY));
        expect(mockPushData).toHaveBeenCalledWith(
            expect.objectContaining({
                properties: createTestProperties<IComparisonControlProperties>({
                    comparison: { enabled: true, calculationType: CalculateAs.CHANGE },
                }),
            }),
        );
    });
});
