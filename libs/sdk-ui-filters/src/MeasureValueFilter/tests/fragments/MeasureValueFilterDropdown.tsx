// (C) 2019 GoodData Corporation
import { ReactWrapper } from "enzyme";
import { string as stringUtils } from "@gooddata/js-utils";

const CLASS_APPLY_BUTTON = ".s-mvf-dropdown-apply";
const CLASS_CANCEL_BUTTON = ".s-mvf-dropdown-cancel";

const CLASS_OPERATOR_DROPDOWN_BUTTON = ".s-mvf-operator-dropdown-button";
const CLASS_OPERATOR_DROPDOWN_BODY = ".s-mvf-operator-dropdown-body";

export default class MeasureValueFilterFragment {
    private component: ReactWrapper = null;

    constructor(component: ReactWrapper) {
        this.component = component;
    }

    public getOperatorDropdownButton = () => this.component.find(CLASS_OPERATOR_DROPDOWN_BUTTON).hostNodes();
    public isOperatorDropdownOpen = () => this.component.find(CLASS_OPERATOR_DROPDOWN_BODY).exists();

    public clickApply = () => {
        this.component.find(CLASS_APPLY_BUTTON).hostNodes().simulate("click");
        return this;
    };

    public clickCancel = () => {
        this.component.find(CLASS_CANCEL_BUTTON).hostNodes().simulate("click");
        return this;
    };

    public openOperatorDropdown = () => {
        if (!this.isOperatorDropdownOpen()) {
            this.getOperatorDropdownButton().simulate("click");
        }
        return this;
    };

    public getOperator = (operator: string) =>
        this.component.find(`.s-mvf-operator-${stringUtils.simplifyText(operator)}`).hostNodes();

    public selectOperator = (operator: string) => {
        this.getOperator(operator).simulate("click");
        return this;
    };

    public getComparisonValueInput = () => this.component.find(".s-mvf-comparison-value-input input");

    public setComparisonValue = (value: string) => {
        this.getComparisonValueInput().simulate("change", { target: { value } });
        return this;
    };

    public getRangeFromInput = () => this.component.find(".s-mvf-range-from-input input");

    public setRangeFrom = (value: string) => {
        this.getRangeFromInput().simulate("change", { target: { value } });
        return this;
    };

    public getRangeToInput = () => this.component.find(".s-mvf-range-to-input input");

    public setRangeTo = (value: string) => {
        this.getRangeToInput().simulate("change", { target: { value } });
        return this;
    };

    public isApplyButtonDisabled = () => {
        return this.component.find(CLASS_APPLY_BUTTON).at(0).prop("disabled");
    };

    public pressEnterInComparisonInput = () =>
        this.getComparisonValueInput().simulate("keydown", { keyCode: 13 });

    public getSelectedOperatorTitle = () => this.getOperatorDropdownButton().text();

    public getInputSuffixes = () => this.component.find(".gd-input-suffix");

    public getWarningMessage = () => this.component.find(".s-mvf-warning-message");

    public getWarningMessageText = () => this.getWarningMessage().text();

    public toggleTreatNullAsCheckbox = () => {
        const isChecked = this.getTreatNullAsCheckbox().props().checked;
        this.getTreatNullAsCheckbox().simulate("change", { target: { checked: !isChecked } });
        return this;
    };

    public getTreatNullAsCheckbox = () => this.component.find(".s-treat-null-values-as-zero .input-checkbox");
}
