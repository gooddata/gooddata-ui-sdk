// (C) 2023-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { type IComparisonControlProperties } from "../../../../interfaces/ControlProperties.js";
import { type IVisualizationProperties } from "../../../../interfaces/Visualization.js";
import { createTestProperties } from "../../../../testDataProvider.js";
import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import type * as CheckboxControlModule from "../../CheckboxControl.js";
import { COMPARISON_IS_ARROW_ENABLED_PATH } from "../ComparisonValuePath.js";

import type * as ArrowControlModule from "./ArrowControl.js";

vi.mock("../../CheckboxControl.js", async (importOriginal) => {
    // oxlint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import("../../CheckboxControl.js")>();
    return {
        ...actual,
        CheckboxControl: vi.fn(actual.CheckboxControl),
    };
});

/*
 * Test isolation is disabled for this package, so the module cache is shared between test files:
 * ArrowControl.js may already have been evaluated - bound to the real CheckboxControl - by another test
 * file, and the mocked graph this file builds must not outlive it. Re-import both modules up front so this
 * file always observes the mocked one, and drop the mocked graph again on the way out.
 */
let CheckboxControl: typeof CheckboxControlModule.CheckboxControl;
let ArrowControl: typeof ArrowControlModule.ArrowControl;

beforeAll(async () => {
    vi.resetModules();
    ({ CheckboxControl } = await import("../../CheckboxControl.js"));
    ({ ArrowControl } = await import("./ArrowControl.js"));
});

afterAll(() => {
    vi.resetModules();
});

const TITLE_TEXT_QUERY = "Arrow";
const CHECKBOX_SELECTOR = "input";

describe("ArrowControl", () => {
    const mockPushData = vi.fn();

    const DEFAULT_PROPS = {
        disabled: false,
        properties: createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
                isArrowEnabled: false,
            },
        }),
        pushData: mockPushData,
    };

    const renderArrowControl = (
        params: {
            disabled?: boolean;
            properties?: IVisualizationProperties<IComparisonControlProperties>;
        } = {},
    ) => {
        const props = {
            ...DEFAULT_PROPS,
            ...params,
        };

        return render(
            <InternalIntlWrapper>
                <ArrowControl {...props} />
            </InternalIntlWrapper>,
        );
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("Should render title correctly", () => {
        const { getByText } = renderArrowControl();
        expect(getByText(TITLE_TEXT_QUERY)).toBeInTheDocument();
    });

    it("Should render arrow control unchecked status", () => {
        const MockCheckboxControl = vi.mocked(CheckboxControl);
        renderArrowControl();

        expect(MockCheckboxControl).toHaveBeenCalledWith(
            expect.objectContaining({
                ...DEFAULT_PROPS,
                valuePath: COMPARISON_IS_ARROW_ENABLED_PATH,
                checked: false,
            }),
            undefined,
        );
    });

    it("Should render arrow control checked status", () => {
        const MockCheckboxControl = vi.mocked(CheckboxControl);
        renderArrowControl({
            properties: createTestProperties<IComparisonControlProperties>({
                comparison: {
                    enabled: true,
                    isArrowEnabled: true,
                },
            }),
        });

        expect(MockCheckboxControl).toHaveBeenCalledWith(
            expect.objectContaining({
                valuePath: COMPARISON_IS_ARROW_ENABLED_PATH,
                checked: true,
            }),
            undefined,
        );
    });

    it("Should push data while click checkbox value", () => {
        const { container } = renderArrowControl();
        fireEvent.click(container.querySelector(CHECKBOX_SELECTOR)!);
        expect(mockPushData).toHaveBeenCalled();
    });

    it("Should disabled arrow checkbox", () => {
        const { container } = renderArrowControl({
            disabled: true,
        });
        expect(container.querySelector(CHECKBOX_SELECTOR)).toHaveAttribute("disabled");
    });
});
