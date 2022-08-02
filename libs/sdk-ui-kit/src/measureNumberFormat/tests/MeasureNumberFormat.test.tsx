// (C) 2020-2022 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";
import cx from "classnames";
import { ISeparators, withIntl } from "@gooddata/sdk-ui";

import { MeasureNumberFormat, IMeasureNumberFormatOwnProps } from "../MeasureNumberFormat";
import MeasureNumberFormatFragment from "./fragments/MeasureNumberFormatFragment";
import { IFormatTemplate, IToggleButtonProps } from "../typings";

// CodeMirror window method requirements
(window as any).document.body.createTextRange = jest.fn(() => {
    return {
        setStart: jest.fn(),
        setEnd: jest.fn(),
        getBoundingClientRect: jest.fn(),
        getClientRects: jest.fn(() => {
            return { length: null };
        }),
    };
});

const getButtonComponent =
    (): React.FC<IToggleButtonProps> =>
    // eslint-disable-next-line react/display-name
    ({ isOpened, text, toggleDropdown }) => {
        return (
            <div
                className={cx("toggle-button", {
                    opened: isOpened,
                    closed: !isOpened,
                })}
                onClick={toggleDropdown}
            >
                {text}
            </div>
        );
    };

const presets = [
    {
        name: "Currency",
        localIdentifier: "currency",
        format: "€ #,##0.0",
        previewNumber: 1000.12,
    },
];
const separators: ISeparators = {
    decimal: ",",
    thousand: " ",
};
const defaultProps: IMeasureNumberFormatOwnProps = {
    toggleButton: getButtonComponent(),
    presets,
    separators,
    selectedFormat: null,
    setFormat: noop,
};

const renderComponent = (props?: Partial<IMeasureNumberFormatOwnProps>) => {
    const Wrapped = withIntl(MeasureNumberFormat);
    return new MeasureNumberFormatFragment(mount(<Wrapped {...defaultProps} {...props} />), ".toggle-button");
};

describe("Measure number format", () => {
    it("should render given button component", () => {
        const component = renderComponent();

        expect(component.getPresetsDropdownToggleButton().exists()).toEqual(true);
    });

    it("should toggle presets dropdown on toggle button click", () => {
        const component = renderComponent();
        const toggleButton = component.getPresetsDropdownToggleButton();

        toggleButton.simulate("click");
        expect(component.getPresetsDropdownToggleButton().hasClass("opened")).toEqual(true);
        expect(component.isPresetsDropdownOpen()).toEqual(true);

        toggleButton.simulate("click");
        expect(component.getPresetsDropdownToggleButton().hasClass("closed")).toEqual(true);
        expect(component.isPresetsDropdownOpen()).toEqual(false);
    });

    it("should call 'setFormat' callback with format when preset is selected", () => {
        const setFormat = jest.fn();
        const component = renderComponent({ setFormat });

        component.openPresetsDropdown().selectPreset("Currency");
        expect(component.isPresetsDropdownOpen()).toEqual(false);
        expect(setFormat).toHaveBeenCalledWith(presets[0].format);
    });

    describe("custom format dialog", () => {
        it("should close the presets dropdown and open the dialog when custom preset is selected", () => {
            const setFormat = jest.fn();
            const component = renderComponent({ setFormat });

            component.openPresetsDropdown().selectCustomFormat();
            expect(component.isPresetsDropdownOpen()).toEqual(false);
            expect(component.isCustomFormatDialogOpen()).toEqual(true);
        });

        it("should close the dialog when cancel is clicked on", () => {
            const component = renderComponent();

            component.openPresetsDropdown().selectCustomFormat().clickCustomFormatCancel();
            expect(component.isCustomFormatDialogOpen()).toEqual(false);
        });

        describe("custom format preview", () => {
            it("should not display formatted number when no format is provided", () => {
                const component = renderComponent();

                component.openPresetsDropdown().selectCustomFormat();
                expect(component.getPreviewFormattedNumber()).toEqual("");
            });
        });

        it("should render documentation link with given url", () => {
            const component = renderComponent({ documentationLink: "https://www.gooddata.com" });

            component.openPresetsDropdown().selectCustomFormat();
            expect(component.getDocumentationLink().exists()).toEqual(true);
            expect(component.getDocumentationLink().props().href).toEqual("https://www.gooddata.com");
        });

        describe("custom format templates", () => {
            const templates: IFormatTemplate[] = [
                {
                    name: "Percentage",
                    localIdentifier: "percentage",
                    format: "#,##0.0%",
                },
                {
                    name: "Currency",
                    localIdentifier: "currency",
                    format: "€ #,##0.0",
                },
            ];

            it("should not render templates button if no templates were provided", () => {
                const component = renderComponent();

                component.openPresetsDropdown().selectCustomFormat();
                expect(component.getTemplatesDropdownToggleButton().exists()).toEqual(false);
            });

            it("should open templates dropdown containing given templates upon toggle button click", () => {
                const component = renderComponent({ templates });

                component.openPresetsDropdown().selectCustomFormat();

                const toggleButton = component.getTemplatesDropdownToggleButton();

                toggleButton.simulate("click");
                expect(component.isTemplatesDropdownOpen()).toEqual(true);
                expect(component.getTemplateByName("Percentage").exists()).toEqual(true);
                expect(component.getTemplateByName("Currency").exists()).toEqual(true);
            });

            it("should display template preview when hover over help icon", () => {
                const templateName = "Currency";
                const component = renderComponent({ templates });

                const templateHelpIcon = component
                    .openPresetsDropdown()
                    .selectCustomFormat()
                    .openTemplatesDropdown()
                    .getTemplateHelpIcon(templateName);

                templateHelpIcon.simulate("mouseenter");
                expect(component.isTemplatePreviewBubbleOpen(templateName)).toEqual(true);

                const templatePreviewFormattedValues =
                    component.getTemplatePreviewBubbleFormattedValues(templateName);
                const expectedTemplatePreviewFormattedValues = [
                    "€ -1 234 567,9",
                    "€ -1 234,6",
                    "€ -1,2",
                    "€ 0,0",
                    "€ 1,2",
                    "€ 1 234,6",
                    "€ 1 234 567,9",
                ];

                expect(expectedTemplatePreviewFormattedValues).toEqual(templatePreviewFormattedValues);

                templateHelpIcon.simulate("mouseleave");
                expect(component.isTemplatePreviewBubbleOpen(templateName)).toEqual(false);
            });
        });
    });
});
