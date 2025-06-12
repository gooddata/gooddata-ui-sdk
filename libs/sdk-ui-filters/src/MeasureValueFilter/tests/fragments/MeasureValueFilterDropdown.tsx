// (C) 2019-2023 GoodData Corporation
import { fireEvent, screen } from "@testing-library/react";
import { stringUtils } from "@gooddata/util";

const CLASS_OPERATOR_DROPDOWN_BUTTON = ".s-mvf-operator-dropdown-button";
const CLASS_OPERATOR_DROPDOWN_BODY = ".s-mvf-operator-dropdown-body";

export default class MeasureValueFilterFragment {
    public getOperatorDropdown = (): HTMLElement => document.querySelector(CLASS_OPERATOR_DROPDOWN_BODY);

    public getOperatorDropdownButton = () => document.querySelector(CLASS_OPERATOR_DROPDOWN_BUTTON);

    public isOperatorDropdownOpen = () => !!this.getOperatorDropdown();

    public getApplyButton = () => screen.getByText("Apply").parentElement;

    public clickApply = () => {
        fireEvent.click(this.getApplyButton());
        return this;
    };

    public clickCancel = () => {
        fireEvent.click(screen.getByText("Cancel"));
        return this;
    };

    public openOperatorDropdown = () => {
        if (!this.isOperatorDropdownOpen()) {
            fireEvent.click(this.getOperatorDropdownButton());
        }
        return this;
    };

    public getOperator = (operator: string) =>
        document.querySelector(`.s-mvf-operator-${stringUtils.simplifyText(operator)}`);

    public getOperatorBubbles = (operator: string) =>
        document.querySelectorAll(`.s-mvf-operator-${stringUtils.simplifyText(operator)} .tooltip-bubble`);

    public selectOperator = (operator: string) => {
        fireEvent.click(this.getOperator(operator));
        return this;
    };

    public getComparisonValueInput = (): HTMLInputElement =>
        document.querySelector(".s-mvf-comparison-value-input input");

    public setComparisonValue = (value: string) => {
        fireEvent.change(this.getComparisonValueInput(), { target: { value } });
        return this;
    };

    public getRangeFromInput = (): HTMLInputElement =>
        document.querySelector(".s-mvf-range-from-input input");

    public setRangeFrom = (value: string) => {
        fireEvent.change(this.getRangeFromInput(), { target: { value } });
        return this;
    };

    public getRangeToInput = (): HTMLInputElement => document.querySelector(".s-mvf-range-to-input input");

    public setRangeTo = (value: string) => {
        fireEvent.change(this.getRangeToInput(), { target: { value } });
        return this;
    };

    public isApplyButtonDisabled = () => this.getApplyButton().classList.contains("disabled");

    public pressEnterInComparisonInput = () =>
        fireEvent.keyDown(this.getComparisonValueInput(), { keyCode: 13 });

    public getSelectedOperatorTitle = () => this.getOperatorDropdownButton().textContent;

    public getInputSuffixes = () => document.querySelectorAll(".gd-input-suffix");

    public getWarningMessage = () => document.querySelector(".s-mvf-warning-message");

    public getWarningMessageBySeverity = (severity: string) =>
        document.querySelector(`.s-mvf-warning-message-${severity}`);

    public clickTreatNullAsCheckbox = () => {
        fireEvent.click(this.getTreatNullAsCheckbox());
        return this;
    };

    public getTreatNullAsCheckbox = (): HTMLInputElement => screen.queryByRole("checkbox", { hidden: true }); //this.component.find(".s-treat-null-values-as-zero .input-checkbox");
}
