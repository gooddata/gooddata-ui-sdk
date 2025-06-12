// (C) 2023 GoodData Corporation
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { render } from "@testing-library/react";
import {
    CalculateAs,
    CalculationType,
    ComparisonPositionValues,
    IDefaultLabelKeys,
} from "@gooddata/sdk-ui-charts";
import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider.js";
import { createTestProperties } from "../../../../../tests/testDataProvider.js";
import { IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";
import LabelSubSection from "../LabelSubSection.js";
import * as InputControl from "../../../InputControl.js";
import * as CheckboxControl from "../../../CheckboxControl.js";
import {
    COMPARISON_LABEL_CONDITIONAL_ENABLED_VALUE_PATH,
    COMPARISON_LABEL_POSITIVE_VALUE_PATH,
    COMPARISON_LABEL_UNCONDITIONAL_VALUE_PATH,
} from "../../ComparisonValuePath.js";
import { comparisonMessages } from "../../../../../../locales.js";
import { IVisualizationProperties } from "../../../../../interfaces/Visualization.js";

const TITLE_TEXT_QUERY = "Label";

const DEFAULT_RATIO_LABEL_KEYS = {
    nonConditionalKey: "visualizations.headline.comparison.title.ratio",
};
const DEFAULT_CHANGE_LABEL_KEYS = {
    nonConditionalKey: "visualizations.headline.comparison.title.change",
    positiveKey: "visualizations.headline.comparison.title.change.positive",
    negativeKey: "visualizations.headline.comparison.title.change.negative",
    equalsKey: "visualizations.headline.comparison.title.change.equals",
};
const DISABLED_POSITION_ON_TOP_KEY = "properties.comparison.labelSubSection.positionOnTop.disabled";
const DISABLED_BY_CONFIG__KEY = "properties.not_applicable";
const DISABLED_MESSAGE_ALIGN_POINTS = [{ align: "cr cl", offset: { x: 0, y: 7 } }];

describe("LabelSubSection", () => {
    const mockPushData = vi.fn();

    const DEFAULT_PROPS = {
        sectionDisabled: false,
        showDisabledMessage: false,
        defaultLabelKeys: DEFAULT_RATIO_LABEL_KEYS,
        calculationType: CalculateAs.RATIO,
        disabledMessageAlignPoints: DISABLED_MESSAGE_ALIGN_POINTS,
        properties: createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
            },
        }),
        pushData: mockPushData,
    };

    const renderLabelSubSection = (
        params: {
            sectionDisabled?: boolean;
            showDisabledMessage?: boolean;
            defaultLabelKeys?: IDefaultLabelKeys;
            calculationType?: CalculationType;
            properties?: IVisualizationProperties<IComparisonControlProperties>;
        } = {},
    ) => {
        const props = {
            ...DEFAULT_PROPS,
            ...params,
        };

        return render(
            <InternalIntlWrapper>
                <LabelSubSection {...props} />
            </InternalIntlWrapper>,
        );
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("Should render title correctly", () => {
        const { getByText } = renderLabelSubSection();
        expect(getByText(TITLE_TEXT_QUERY)).toBeInTheDocument();
    });

    it("Should render label input control with ratio calculation", () => {
        const MockInputControl = vi.spyOn(InputControl, "default");
        const MockCheckboxControl = vi.spyOn(CheckboxControl, "default");
        renderLabelSubSection();

        expect(MockCheckboxControl).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: true,
                checked: false,
                showDisabledMessage: true,
                disabledMessageId: comparisonMessages.labelConditionalDisabledByRatio.id,
                valuePath: COMPARISON_LABEL_CONDITIONAL_ENABLED_VALUE_PATH,
                labelText: comparisonMessages.labelConditionalTitle.id,
            }),
            expect.anything(),
        );

        expect(MockInputControl).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                disabled: false,
                showDisabledMessage: false,
                disabledMessageId: comparisonMessages.labelConditionalDisabledByRatio.id,
                type: "text",
                valuePath: COMPARISON_LABEL_UNCONDITIONAL_VALUE_PATH,
                labelText: comparisonMessages.labelNameTitle.id,
                placeholder: DEFAULT_RATIO_LABEL_KEYS.nonConditionalKey,
                value: "of",
            }),
            expect.anything(),
        );
    });

    it("Should render label input control with change calculation", () => {
        const MockInputControl = vi.spyOn(InputControl, "default");
        const MockCheckboxControl = vi.spyOn(CheckboxControl, "default");

        const properties = createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
                calculationType: CalculateAs.CHANGE,
                labelConfig: {
                    isConditional: true,
                    positive: "test",
                },
            },
        });
        renderLabelSubSection({
            defaultLabelKeys: DEFAULT_CHANGE_LABEL_KEYS,
            calculationType: CalculateAs.CHANGE,
            properties,
        });

        expect(MockCheckboxControl).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: false,
                checked: true,
                showDisabledMessage: false,
                disabledMessageId: undefined,
                valuePath: COMPARISON_LABEL_CONDITIONAL_ENABLED_VALUE_PATH,
                labelText: comparisonMessages.labelConditionalTitle.id,
            }),
            expect.anything(),
        );

        expect(MockInputControl).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                disabled: false,
                showDisabledMessage: false,
                disabledMessageId: undefined,
                type: "text",
                valuePath: COMPARISON_LABEL_POSITIVE_VALUE_PATH,
                labelText: comparisonMessages.labelPositiveTitle.id,
                placeholder: DEFAULT_CHANGE_LABEL_KEYS.positiveKey,
                value: "test",
            }),
            expect.anything(),
        );
    });

    it("Should render label input control with value in label config", () => {
        const { container } = renderLabelSubSection({
            properties: createTestProperties<IComparisonControlProperties>({
                comparison: {
                    enabled: true,
                    labelConfig: {
                        unconditionalValue: "test",
                    },
                },
            }),
        });

        expect(container.querySelector(".gd-input-field").getAttribute("value")).toEqual("test");
    });

    it("Should disabled label input when position on top", () => {
        const MockInputControl = vi.spyOn(InputControl, "default");
        const properties = createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
                position: ComparisonPositionValues.TOP,
            },
        });
        renderLabelSubSection({
            sectionDisabled: false,
            properties,
        });

        expect(MockInputControl).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: true,
                showDisabledMessage: true,
                disabledMessageId: DISABLED_POSITION_ON_TOP_KEY,
            }),
            expect.anything(),
        );
    });

    it("Should not show disabled message in case position is not on top", () => {
        const MockInputControl = vi.spyOn(InputControl, "default");
        const properties = createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
                position: ComparisonPositionValues.RIGHT,
            },
        });
        renderLabelSubSection({
            sectionDisabled: true,
            properties,
        });

        expect(MockInputControl).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: true,
                showDisabledMessage: false,
            }),
            expect.anything(),
        );
    });

    it("Should show disabled message in case position is on top and control is disabled by configuration", () => {
        const MockInputControl = vi.spyOn(InputControl, "default");
        const properties = createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
                position: ComparisonPositionValues.TOP,
            },
        });
        renderLabelSubSection({
            sectionDisabled: true,
            showDisabledMessage: true,
            properties,
        });

        expect(MockInputControl).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: true,
                showDisabledMessage: true,
                disabledMessageId: DISABLED_BY_CONFIG__KEY,
            }),
            expect.anything(),
        );
    });
});
