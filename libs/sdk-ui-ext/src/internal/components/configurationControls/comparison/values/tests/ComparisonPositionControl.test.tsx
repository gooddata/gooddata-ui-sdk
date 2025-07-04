// (C) 2023-2025 GoodData Corporation
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { ComparisonPositionValues } from "@gooddata/sdk-ui-charts";

import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider.js";
import { createTestProperties } from "../../../../../tests/testDataProvider.js";
import { IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";
import ComparisonPositionControl from "../ComparisonPositionControl.js";
import * as DropdownControl from "../../../DropdownControl.js";
import { IVisualizationProperties } from "../../../../../interfaces/Visualization.js";

const TITLE_TEXT_QUERY = "Position";
const DROPDOWN_BUTTON_SELECTOR = "button";
const TOP_ITEM_TEXT_QUERY = "top";

describe("ComparisonPositionControl", () => {
    const mockPushData = vi.fn();

    const DEFAULT_PROPS = {
        disabled: false,
        properties: createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
            },
        }),
        pushData: mockPushData,
    };

    const renderComparisonPositionControl = (
        params: {
            properties?: IVisualizationProperties<IComparisonControlProperties>;
        } = {},
    ) => {
        const props = {
            ...DEFAULT_PROPS,
            ...params,
        };

        return render(
            <InternalIntlWrapper>
                <ComparisonPositionControl {...props} />
            </InternalIntlWrapper>,
        );
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("Should render title correctly", () => {
        const { getByText } = renderComparisonPositionControl();
        expect(getByText(TITLE_TEXT_QUERY)).toBeInTheDocument();
    });

    it("Should render based on dropdown-control", () => {
        const MockDropdownControl = vi.spyOn(DropdownControl, "default");

        renderComparisonPositionControl();
        expect(MockDropdownControl).toHaveBeenCalledWith(
            expect.objectContaining({
                value: ComparisonPositionValues.AUTO,
                properties: DEFAULT_PROPS.properties,
                disabled: DEFAULT_PROPS.disabled,
                pushData: mockPushData,
            }),
            expect.anything(),
        );
    });

    it("Should select provided position", () => {
        const { container } = renderComparisonPositionControl({
            properties: createTestProperties<IComparisonControlProperties>({
                comparison: {
                    enabled: true,
                    position: ComparisonPositionValues.TOP,
                },
            }),
        });

        expect(container.querySelector(DROPDOWN_BUTTON_SELECTOR).textContent).toEqual(TOP_ITEM_TEXT_QUERY);
    });
});
