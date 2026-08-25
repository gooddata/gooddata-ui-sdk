// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ComparisonPositionValues } from "@gooddata/sdk-ui-charts";

import { type IComparisonControlProperties } from "../../../../interfaces/ControlProperties.js";
import { type IVisualizationProperties } from "../../../../interfaces/Visualization.js";
import { createTestProperties } from "../../../../testDataProvider.js";
import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import type * as DropdownControlModule from "../../DropdownControl.js";

import type * as ComparisonPositionControlModule from "./ComparisonPositionControl.js";

vi.mock("../../DropdownControl.js", async (importOriginal) => {
    // oxlint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import("../../DropdownControl.js")>();
    // DropdownControl is a memo component, so mock its inner render function to keep the mock callable
    const { type: DropdownControlComponent } = actual.DropdownControl as unknown as {
        type: typeof actual.DropdownControl;
    };
    return {
        ...actual,
        DropdownControl: vi.fn(DropdownControlComponent),
    };
});

/*
 * Test isolation is disabled for this package, so the module cache is shared between test files:
 * ComparisonPositionControl.js may already have been evaluated - bound to the real DropdownControl - by
 * another test file, and the mocked graph this file builds must not outlive it. Re-import both modules up
 * front so this file always observes the mocked one, and drop the mocked graph again on the way out.
 */
let DropdownControl: typeof DropdownControlModule.DropdownControl;
let ComparisonPositionControl: typeof ComparisonPositionControlModule.ComparisonPositionControl;

beforeAll(async () => {
    vi.resetModules();
    ({ DropdownControl } = await import("../../DropdownControl.js"));
    ({ ComparisonPositionControl } = await import("./ComparisonPositionControl.js"));
});

afterAll(() => {
    vi.resetModules();
});

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
        const MockDropdownControl = vi.mocked(DropdownControl);

        renderComparisonPositionControl();
        expect(MockDropdownControl).toHaveBeenCalledWith(
            expect.objectContaining({
                value: ComparisonPositionValues.AUTO,
                properties: DEFAULT_PROPS.properties,
                disabled: DEFAULT_PROPS.disabled,
                pushData: mockPushData,
            }),
            undefined,
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

        expect(container.querySelector(DROPDOWN_BUTTON_SELECTOR)!.textContent).toEqual(TOP_ITEM_TEXT_QUERY);
    });
});
