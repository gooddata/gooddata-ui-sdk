// (C) 2022 GoodData Corporation

import { mount } from "enzyme";
import React from "react";
import { IStylingEditorDialogProps, StylingEditorDialog, StylingExample } from "../StylingEditorDialog";
import { IThemeMetadataObject } from "@gooddata/sdk-model";

describe("Styling editor dialog", () => {
    const theme = (color: string): IThemeMetadataObject => {
        return {
            title: `Theme ${color}`,
            theme: {
                palette: {
                    primary: {
                        base: color,
                    },
                },
            },
        } as IThemeMetadataObject;
    };

    const referenceTheme = (color: string) => JSON.stringify(theme(color).theme, null, 4);

    const getWrapper = (customProps: Partial<IStylingEditorDialogProps> = {}) => {
        const defaultProps = {
            title: "Dialog title",
            link: {
                text: "Link description.",
                url: "#",
            },
            tooltip: "Tooltip to describe examples usage.",
            stylingContent: theme("red"),
            examples: [theme("green"), theme("blue")],
            exampleToColorPreview: () => ["#313441", "#FFFFFF", "#14B2E2", "#464E56", "#94A1AD", "#E2E7EC"],
        };
        return mount(<StylingEditorDialog {...defaultProps} {...customProps} />);
    };

    it("should render content", () => {
        const wrapper = getWrapper();
        expect(wrapper.find(".s-input-field").hostNodes()).toHaveValue("Theme red");
        expect(wrapper.find(".s-textarea-field").hostNodes()).toHaveValue(referenceTheme("red"));
        expect(wrapper.find(StylingExample).at(0)).toExist();
        expect(wrapper.find(StylingExample).at(1)).toExist();
        expect(wrapper.find(StylingExample).at(2)).not.toExist();
    });

    it("should insert examples into fields", () => {
        const wrapper = getWrapper();
        wrapper.find(".s-gd-styling-example-label-action").at(0).simulate("click");
        expect(wrapper.find(".s-input-field").hostNodes()).toHaveValue("Theme green");
        expect(wrapper.find(".s-textarea-field").hostNodes()).toHaveValue(referenceTheme("green"));

        wrapper.find(".s-gd-styling-example-label-action").at(1).simulate("click");
        expect(wrapper.find(".s-input-field").hostNodes()).toHaveValue("Theme blue");
        expect(wrapper.find(".s-textarea-field").hostNodes()).toHaveValue(referenceTheme("blue"));
    });

    it("should show error with invalid definition field on save and remove error after the fix", () => {
        const wrapper = getWrapper();
        expect(wrapper.find(".s-gd-styling-editor-dialog-content-form-error")).not.toExist();
        wrapper.find(".s-textarea-field").simulate("change", { target: { value: "Not a JSON" } });
        expect(wrapper.find(".s-textarea-field")).toHaveValue("Not a JSON");
        wrapper.find(".s-dialog-submit-button").first().simulate("click");
        expect(wrapper.find(".s-gd-styling-editor-dialog-content-form-error")).toExist();
        wrapper.find(".s-textarea-field").simulate("change", { target: { value: "{}" } });
        expect(wrapper.find(".s-gd-styling-editor-dialog-content-form-error")).not.toExist();
    });

    it("should not render examples if not provided", () => {
        const wrapper = getWrapper({ examples: undefined });
        expect(wrapper.find(".s-gd-styling-editor-dialog-content-examples")).not.toExist();
    });

    it("should render empty fields if stylingContent not provided", () => {
        const wrapper = getWrapper({ stylingContent: undefined });
        expect(wrapper.find(".s-input-field").hostNodes()).toHaveValue("");
        expect(wrapper.find(".s-textarea-field").hostNodes()).toHaveValue("");
    });

    it("should render progress indicator if flag provided", () => {
        const wrapper = getWrapper({ showProgressIndicator: true });
        expect(wrapper.find(".s-gd-styling-editor-spinner")).toExist();
    });

    it("should disable Submit button if flag provided", () => {
        const wrapper = getWrapper({ disableSubmit: true });
        expect(wrapper.find(".s-dialog-submit-button.disabled")).toExist();
    });
});
