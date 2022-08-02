// (C) 2020-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ReactWrapper } from "enzyme";
import { stringUtils } from "@gooddata/util";

const CUSTOM_FORMAT_APPLY_BUTTON_SELECTOR = ".s-custom-format-dialog-apply";
const CUSTOM_FORMAT_CANCEL_BUTTON_SELECTOR = ".s-custom-format-dialog-cancel";

const PRESETS_DROPDOWN_SELECTOR = ".s-measure-number-format-dropdown-body";
const CUSTOM_FORMAT_DIALOG_SELECTOR = ".s-custom-format-dialog-body";

const CUSTOM_FORMAT_PREVIEW_INPUT = ".s-custom-format-dialog-preview-input";
const PREVIEW_FORMATTED_NUMBER_SELECTOR = ".s-custom-format-dialog-preview-formatted";
const SHOW_EXTENDED_PREVIEW_BUTTON_SELECTOR = ".s-custom-format-dialog-extended-preview-button";
const EXTENDED_PREVIEW_FORMATTED_SELECTOR =
    ".s-custom-format-dialog-extended-preview .s-number-format-preview-formatted";

const DOCUMENTATION_LINK_SELECTOR = ".s-custom-format-dialog-documentation-link";

const TEMPLATES_DROPDOWN_TOGGLE_BUTTON_SELECTOR = ".s-measure-format-templates-toggle-button";
const TEMPLATES_DROPDOWN_BODY_SELECTOR = ".s-measure-number-format-templates-dropdown";
const TEMPLATE_PREVIEW_ICON_SELECTOR = ".s-measure-format-template-help-toggle-icon";

export default class MeasureNumberFormatFragment {
    private component: ReactWrapper;
    private presetDropdownToggleButtonSelector: string;

    constructor(component: ReactWrapper, presetDropdownToggleButtonSelector: string) {
        this.component = component;
        this.presetDropdownToggleButtonSelector = presetDropdownToggleButtonSelector;
    }

    public isPresetsDropdownOpen = () => this.component.find(PRESETS_DROPDOWN_SELECTOR).exists();

    public getPresetsDropdownToggleButton = () =>
        this.component.find(this.presetDropdownToggleButtonSelector).hostNodes();

    public openPresetsDropdown = () => {
        if (!this.isPresetsDropdownOpen()) {
            this.getPresetsDropdownToggleButton().simulate("click");
        }
        return this;
    };

    public getFormatPresetByLocalIdentifier = (localIdentifier: string) =>
        this.component.find(`.s-format-preset-${localIdentifier}`).hostNodes();

    public getFormatPresetByName = (preset: string) =>
        this.component.find(`.s-format-preset-name-${stringUtils.simplifyText(preset)}`).hostNodes();

    public selectPreset = (preset: string) => {
        this.getFormatPresetByName(preset).simulate("click");
        return this;
    };

    public selectCustomFormat = () => {
        this.getFormatPresetByLocalIdentifier("customFormat").simulate("click");
        return this;
    };

    public isCustomFormatDialogOpen = () => this.component.find(CUSTOM_FORMAT_DIALOG_SELECTOR).exists();

    public isCustomFormatApplyButtonDisabled = () => {
        this.component.update();
        return this.component.find(CUSTOM_FORMAT_APPLY_BUTTON_SELECTOR).at(0).prop("disabled");
    };

    public clickCustomFormatApply = () => {
        this.component.find(CUSTOM_FORMAT_APPLY_BUTTON_SELECTOR).hostNodes().simulate("click");
        return this;
    };

    public clickCustomFormatCancel = () => {
        this.component.find(CUSTOM_FORMAT_CANCEL_BUTTON_SELECTOR).hostNodes().simulate("click");
        return this;
    };

    public setPreviewNumber = (value: string) => {
        this.getCustomFormatPreviewInput().simulate("change", { target: { value } });
        return this;
    };

    public getPreviewFormattedNumber = () => this.component.find(PREVIEW_FORMATTED_NUMBER_SELECTOR).text();

    public getShowExtendedPreviewButton = () =>
        this.component.find(SHOW_EXTENDED_PREVIEW_BUTTON_SELECTOR).hostNodes();

    public showExtendedPreview = () => this.getShowExtendedPreviewButton().simulate("click");

    public getExtendedPreviewFormattedValues = () => {
        return this.component
            .find(EXTENDED_PREVIEW_FORMATTED_SELECTOR)
            .hostNodes()
            .map((row) => row.text());
    };

    public getDocumentationLink = () => this.component.find(DOCUMENTATION_LINK_SELECTOR).hostNodes();

    public getTemplatesDropdownToggleButton = () =>
        this.component.find(TEMPLATES_DROPDOWN_TOGGLE_BUTTON_SELECTOR).hostNodes();

    public isTemplatesDropdownOpen = () => this.component.find(TEMPLATES_DROPDOWN_BODY_SELECTOR).exists();

    public getTemplateByName = (template: string) =>
        this.component.find(`.s-measure-format-template-${stringUtils.simplifyText(template)}`).hostNodes();

    public getTemplateHelpIcon = (template: string) =>
        this.getTemplateByName(template).find(TEMPLATE_PREVIEW_ICON_SELECTOR).hostNodes();

    public openTemplatesDropdown = () => {
        if (!this.isTemplatesDropdownOpen()) {
            this.getTemplatesDropdownToggleButton().simulate("click");
        }
        return this;
    };

    public isTemplatePreviewBubbleOpen = (template: string) =>
        this.component
            .find(`.s-measure-format-template-help-bubble-${stringUtils.simplifyText(template)}`)
            .exists();

    public getTemplatePreviewBubbleFormattedValues = (template: string) => {
        return this.component
            .find(
                `.s-measure-format-template-help-bubble-${stringUtils.simplifyText(
                    template,
                )} .s-number-format-preview-formatted`,
            )
            .hostNodes()
            .map((row) => row.text());
    };

    private getCustomFormatPreviewInput = () => this.component.find(CUSTOM_FORMAT_PREVIEW_INPUT).hostNodes();
}
