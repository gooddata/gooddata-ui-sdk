// (C) 2020-2026 GoodData Corporation

import { fireEvent, screen } from "@testing-library/react";

import { stringUtils } from "@gooddata/util";

const OPERATOR_DROPDOWN_BUTTON = ".s-rf-operator-dropdown-button";
const OPERATOR_DROPDOWN_BODY = ".s-rf-operator-dropdown-body";
const VALUE_DROPDOWN_INPUT = ".s-rf-value-dropdown-button input";
const VALUE_DROPDOWN_ITEM = ".s-rf-value-dropdown-item";
const MEASURE_DROPDOWN_BUTTON = ".s-rf-measure-dropdown-button";
const MEASURE_DROPDOWN_BODY = ".s-rf-measure-dropdown-body";
const ATTRIBUTE_DROPDOWN_BUTTON = ".s-rf-attribute-dropdown-button";
const ATTRIBUTE_DROPDOWN_BODY = ".s-rf-attribute-dropdown-body";
const ATTRIBUTE_ALL_RECORDS = ".s-rf-attribute-all-records";
const PREVIEW_TEXT = ".s-rf-preview";

export class RankingFilterDropdownFragment {
    public clickCancel = (): RankingFilterDropdownFragment => {
        fireEvent.click(screen.getByText("Cancel"));
        return this;
    };

    public clickApply = (): RankingFilterDropdownFragment => {
        fireEvent.click(this.getApplyButton()!);
        return this;
    };

    public getApplyButton = () => screen.getByText("Apply").parentElement;

    public isApplyButtonDisabled = () => this.getApplyButton()!.classList.contains("disabled");

    public isOperatorDropdownOpen = (): boolean => !!document.querySelector(OPERATOR_DROPDOWN_BODY);

    public getOperatorDropdownButton = () => document.querySelector(OPERATOR_DROPDOWN_BUTTON);

    public openOperatorDropdown = (): RankingFilterDropdownFragment => {
        if (!this.isOperatorDropdownOpen()) {
            fireEvent.click(this.getOperatorDropdownButton()!);
        }
        return this;
    };

    public setOperator = (value: string): RankingFilterDropdownFragment => {
        fireEvent.click(document.querySelector(`.s-rf-operator-${stringUtils.simplifyText(value)}`)!);
        return this;
    };

    public getOperator = (): string => document.querySelector(OPERATOR_DROPDOWN_BUTTON)!.textContent;

    public getValueDropdown = () => document.querySelector(".gd-dynamic-select-menu");

    public getValueDropdownItems = () =>
        this.getValueDropdown()!.querySelectorAll(".s-rf-value-dropdown-item");

    public isValueDropdownVisible = () => !!this.getValueDropdown();

    public changeInputValue = (value: string): RankingFilterDropdownFragment => {
        const input = document.querySelector(VALUE_DROPDOWN_INPUT)!;
        fireEvent.change(input, { target: { value } });
        return this;
    };

    public setValue = (value: string): RankingFilterDropdownFragment => {
        this.changeInputValue(value);
        fireEvent.click(document.querySelector(VALUE_DROPDOWN_ITEM)!);
        return this;
    };

    public setValueByBlur = (value: string): RankingFilterDropdownFragment => {
        this.changeInputValue(value);
        fireEvent.blur(document.querySelector(VALUE_DROPDOWN_INPUT)!);
        return this;
    };

    public getValue = () => (document.querySelector(VALUE_DROPDOWN_INPUT) as HTMLInputElement).value;

    public isMeasureDropdownOpen = (): boolean => !!document.querySelector(MEASURE_DROPDOWN_BODY);

    public getMeasureDropdownButton = () => document.querySelector(MEASURE_DROPDOWN_BUTTON);

    public openMeasureDropdown = (): RankingFilterDropdownFragment => {
        if (!this.isMeasureDropdownOpen()) {
            fireEvent.click(document.querySelector(MEASURE_DROPDOWN_BUTTON)!);
        }
        return this;
    };

    public getMeasureItem = (value: string) => {
        return document.querySelector(`.s-rf-measure-${stringUtils.simplifyText(value)}`);
    };

    public setMeasureItem = (value: string): RankingFilterDropdownFragment => {
        fireEvent.click(this.getMeasureItem(value)!);
        return this;
    };

    public getMeasure = (): string => document.querySelector(MEASURE_DROPDOWN_BUTTON)!.textContent;

    public isAttributeButtonDisabled = (): boolean =>
        this.getAttributeDropdownButton()!.classList.contains("disabled");

    public isAttributeDropdownOpen = (): boolean => !!document.querySelector(ATTRIBUTE_DROPDOWN_BODY);

    public openAttributeDropdown = (): RankingFilterDropdownFragment => {
        if (!this.isAttributeDropdownOpen()) {
            fireEvent.click(this.getAttributeDropdownButton()!);
        }
        return this;
    };

    public getAttributeDropdownDisabledButtons = () => {
        return document.querySelectorAll(`${ATTRIBUTE_DROPDOWN_BODY} button.disabled`);
    };

    public getAttributeItem = (value: string) => {
        return document.querySelector(`.s-rf-attribute-${stringUtils.simplifyText(value)}`);
    };

    public setAttributeItem = (value: string): RankingFilterDropdownFragment => {
        fireEvent.click(this.getAttributeItem(value)!);
        return this;
    };

    public setAttributeToAllRecords = (): RankingFilterDropdownFragment => {
        fireEvent.click(document.querySelector(ATTRIBUTE_ALL_RECORDS)!);
        return this;
    };

    public getAttributeDropdownButton = () => document.querySelector(ATTRIBUTE_DROPDOWN_BUTTON);

    public getAttribute = (): string => this.getAttributeDropdownButton()!.textContent;

    public getPreview = (): string => document.querySelector(PREVIEW_TEXT)!.textContent;
}
