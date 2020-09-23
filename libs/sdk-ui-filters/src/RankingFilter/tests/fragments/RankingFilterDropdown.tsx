// (C) 2020 GoodData Corporation
import { ReactWrapper } from "enzyme";
import { stringUtils } from "@gooddata/util";
import { DynamicSelect } from "../../../DateFilter/DynamicSelect/DynamicSelect";
import { VirtualizedSelectMenu } from "../../../DateFilter/Select/VirtualizedSelectMenu";

const APPLY_BUTTON = ".s-rf-dropdown-apply";
const CANCEL_BUTTON = ".s-rf-dropdown-cancel";
const OPERATOR_DROPDOWN_BUTTON = ".s-rf-operator-dropdown-button";
const OPERATOR_DROPDOWN_BODY = ".s-rf-operator-dropdown-body";
const VALUE_DROPDOWN_INPUT = ".s-rf-value-dropdown-button input";
const VALUE_DROPDOWN_ITEM = ".s-rf-value-dropdown-item";
const MEASURE_DROPDOWN_BUTTON = ".s-rf-measure-dropdown-button";
const MEASURE_DROPDOWN_BODY = ".s-rf-measure-dropdown-body";
const ATTRIBUTE_DROPDOWN_BUTTON = ".s-rf-attribute-dropdown-button";
const ATTRIBUTE_DROPDOWN_BODY = ".s-rf-attribute-dropdown-body";
const ATTRIBUTE_ALL_RECORDS = ".s-rf-attribute-all-records";

export class RankingFilterDropdownFragment {
    private component: ReactWrapper = null;

    constructor(component: ReactWrapper) {
        this.component = component;
    }

    public getWrapper = (): ReactWrapper => {
        return this.component;
    };

    public clickCancel = (): RankingFilterDropdownFragment => {
        this.component.find(CANCEL_BUTTON).hostNodes().simulate("click");
        return this;
    };

    public clickApply = (): RankingFilterDropdownFragment => {
        this.component.find(APPLY_BUTTON).hostNodes().simulate("click");
        return this;
    };

    public isApplyButtonDisabled = (): boolean => {
        return this.component.find(APPLY_BUTTON).hostNodes().hasClass("disabled");
    };

    public isOperatorDropdownOpen = (): boolean => this.component.find(OPERATOR_DROPDOWN_BODY).exists();

    public openOperatorDropdown = (): RankingFilterDropdownFragment => {
        if (!this.isOperatorDropdownOpen()) {
            this.component.find(OPERATOR_DROPDOWN_BUTTON).hostNodes().simulate("click");
        }
        return this;
    };

    public setOperator = (value: string): RankingFilterDropdownFragment => {
        this.component
            .find(`.s-rf-operator-${stringUtils.simplifyText(value)}`)
            .hostNodes()
            .simulate("click");
        return this;
    };

    public getOperator = (): string => this.component.find(OPERATOR_DROPDOWN_BUTTON).hostNodes().text();

    public getValueDropdown = (): ReactWrapper => {
        return this.component.find(DynamicSelect).find(VirtualizedSelectMenu);
    };

    public isValueDropdownVisible = (): boolean => {
        return this.component.find(DynamicSelect).find(VirtualizedSelectMenu).exists();
    };

    public isValueDropdownOpen = (): boolean =>
        this.component.find(DynamicSelect).find(VirtualizedSelectMenu).exists();

    public openValueDropdown = (): RankingFilterDropdownFragment => {
        if (!this.isValueDropdownOpen()) {
            this.component.find(VALUE_DROPDOWN_INPUT).hostNodes().simulate("change");
        }
        return this;
    };

    public changeInputValue = (value: string): RankingFilterDropdownFragment => {
        const input = this.component.find(VALUE_DROPDOWN_INPUT);
        input.simulate("change", { target: { value } });
        return this;
    };

    public setValue = (value: string): RankingFilterDropdownFragment => {
        this.changeInputValue(value);
        this.component.find(VALUE_DROPDOWN_ITEM).hostNodes().simulate("click");
        return this;
    };

    public setValueByBlur = (value: string): RankingFilterDropdownFragment => {
        this.changeInputValue(value);
        this.component.find(VALUE_DROPDOWN_INPUT).hostNodes().simulate("blur");
        return this;
    };

    public getValue = (): number | string | readonly string[] =>
        this.component.find(VALUE_DROPDOWN_INPUT).props().value;

    public isMeasureDropdownOpen = (): boolean => this.component.find(MEASURE_DROPDOWN_BODY).exists();

    public openMeasureDropdown = (): RankingFilterDropdownFragment => {
        if (!this.isMeasureDropdownOpen()) {
            this.component.find(MEASURE_DROPDOWN_BUTTON).hostNodes().simulate("click");
        }
        return this;
    };

    public getMeasureItem = (value: string): ReactWrapper => {
        return this.component.find(`.s-rf-measure-${stringUtils.simplifyText(value)}`).hostNodes();
    };

    public setMeasureItem = (value: string): RankingFilterDropdownFragment => {
        this.getMeasureItem(value).simulate("click");
        return this;
    };

    public getMeasure = (): string => this.component.find(MEASURE_DROPDOWN_BUTTON).hostNodes().text();

    public isAttributeButtonDisabled = (): boolean =>
        this.component.find(ATTRIBUTE_DROPDOWN_BUTTON).hostNodes().hasClass("disabled");

    public isAttributeDropdownOpen = (): boolean => this.component.find(ATTRIBUTE_DROPDOWN_BODY).exists();

    public openAttributeDropdown = (): RankingFilterDropdownFragment => {
        if (!this.isAttributeDropdownOpen()) {
            this.component.find(ATTRIBUTE_DROPDOWN_BUTTON).hostNodes().simulate("click");
        }
        return this;
    };

    public getAttributeDropdownBody = (): ReactWrapper => {
        return this.component.find(ATTRIBUTE_DROPDOWN_BODY);
    };

    public getAttributeItem = (value: string): ReactWrapper => {
        return this.component.find(`.s-rf-attribute-${stringUtils.simplifyText(value)}`).hostNodes();
    };

    public setAttributeItem = (value: string): RankingFilterDropdownFragment => {
        this.getAttributeItem(value).simulate("click");
        return this;
    };

    public setAttributeToAllRecords = (): RankingFilterDropdownFragment => {
        this.component.find(ATTRIBUTE_ALL_RECORDS).hostNodes().simulate("click");
        return this;
    };

    public getAttribute = (): string => this.component.find(ATTRIBUTE_DROPDOWN_BUTTON).hostNodes().text();
}
