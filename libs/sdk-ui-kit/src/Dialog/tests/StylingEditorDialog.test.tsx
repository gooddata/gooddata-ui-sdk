// (C) 2022 GoodData Corporation
import { ITheme } from "@gooddata/sdk-model";

import { mount } from "enzyme";
import React from "react";
import {
    IStylingEditorDialogProps,
    StylingEditorDialog,
    StylingExample,
    IStylingPickerItem,
} from "../StylingEditorDialog";

describe("Styling editor dialog", () => {
    const theme = (color: string): IStylingPickerItem<ITheme> => {
        return {
            name: `Theme ${color}`,
            content: {
                palette: {
                    primary: {
                        base: color,
                    },
                },
            },
        };
    };

    const referenceTheme = (color: string) => JSON.stringify(theme(color).content, null, 4);

    const getWrapper = (customProps: Partial<IStylingEditorDialogProps<ITheme>> = {}) => {
        const defaultProps = {
            title: "Dialog title",
            link: {
                text: "Link description.",
                url: "#",
            },
            tooltip: "Tooltip to describe examples usage.",
            stylingItem: theme("red"),
            examples: [theme("green"), theme("blue")],
            exampleToColorPreview: () => ["#313441", "#FFFFFF", "#14B2E2", "#464E56", "#94A1AD", "#E2E7EC"],
        };
        return mount(<StylingEditorDialog {...defaultProps} {...customProps} />);
    };

    it("should render content", () => {
        const wrapper = getWrapper();
        expect(wrapper.find(".s-input-field").html()).toContain("Theme red");
        expect(wrapper.find(".s-textarea-field").html()).toContain(referenceTheme("red"));
        expect(wrapper.find(StylingExample).at(0)).toExist();
        expect(wrapper.find(StylingExample).at(1)).toExist();
        expect(wrapper.find(StylingExample).at(2)).not.toExist();
    });

    it("should insert examples into fields", () => {
        const wrapper = getWrapper();
        wrapper.find(".s-gd-styling-example-label-action").at(0).simulate("click");
        expect(wrapper.find(".s-input-field").html()).toContain("Theme green");
        expect(wrapper.find(".s-textarea-field").html()).toContain(referenceTheme("green"));

        wrapper.find(".s-gd-styling-example-label-action").at(1).simulate("click");
        expect(wrapper.find(".s-input-field").html()).toContain("Theme blue");
        expect(wrapper.find(".s-textarea-field").html()).toContain(referenceTheme("blue"));
    });

    it("should not render examples if not provided", () => {
        const wrapper = getWrapper({ examples: undefined });
        expect(wrapper.find(".s-gd-styling-editor-dialog-content-examples")).not.toExist();
    });

    // it("should render empty fields if stylingItem not provided", () => {
    //     const wrapper = getWrapper({ stylingItem: undefined });
    //     expect(wrapper.find(".s-input-field").hostNodes()).toHaveValue("");
    //     expect(wrapper.find(".s-textarea-field").hostNodes()).toHaveValue("");
    // });

    it("should disable save if no changes are provided (ignore white-spacing)", () => {
        const wrapper = getWrapper();
        expect(wrapper.find(".s-dialog-submit-button").first().html()).toContain("disabled");
        wrapper.find(".s-textarea-field").simulate("change", {
            target: { value: JSON.stringify(theme("red").content) },
        });
        expect(wrapper.find(".s-dialog-submit-button").first().html()).toContain("disabled");
    });

    it("should disable save if no Name or Definition is provided", () => {
        const wrapper = getWrapper({ stylingItem: undefined });
        wrapper.find(".s-textarea-field").simulate("change", { target: { value: "{}" } });
        expect(wrapper.find(".s-dialog-submit-button").first().html()).toContain("disabled");
        wrapper.find(".s-input-field").simulate("change", { target: { value: "Name" } });
        expect(wrapper.find(".s-dialog-submit-button").first().html()).not.toContain("disabled");
        wrapper.find(".s-textarea-field").simulate("change", { target: { value: "" } });
        expect(wrapper.find(".s-dialog-submit-button").first().html()).toContain("disabled");
    });

    it("should disable save if Definition is invalid JSON", () => {
        const wrapper = getWrapper();
        wrapper.find(".s-textarea-field").simulate("change", { target: { value: "invalid {}" } });
        expect(wrapper.find(".s-dialog-submit-button").first().html()).toContain("disabled");
        wrapper.find(".s-textarea-field").simulate("change", { target: { value: "{}" } });
        expect(wrapper.find(".s-dialog-submit-button").first().html()).not.toContain("disabled");
    });

    it("should enable save after click Post Example", () => {
        const wrapper = getWrapper({ stylingItem: undefined });
        expect(wrapper.find(".s-dialog-submit-button").first().html()).toContain("disabled");
        wrapper.find(".s-gd-styling-example-label-action").at(0).simulate("click");
        expect(wrapper.find(".s-dialog-submit-button").first().html()).not.toContain("disabled");
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
