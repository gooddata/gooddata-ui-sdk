// (C) 2022 GoodData Corporation
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { WrapperType } from "./extendedDateFilters_helpers";

const rangePicker = ".s-date-range-picker";
const error = ".s-absolute-range-error";
const startDateInput = ".s-date-range-picker-from .s-date-range-picker-input-field";
const endDateInput = ".s-date-range-picker-to .s-date-range-picker-input-field";
const startTimeInput = ".s-date-range-picker-from .s-date-range-picker-input-time .input-text";
const endTimeInput = ".s-date-range-picker-to .s-date-range-picker-input-time .input-text";

export class AbsoluteForm {
    private wrapper: WrapperType;

    constructor(wrapper: WrapperType) {
        this.wrapper = wrapper;
    }

    public setStartDate = (value: string) => {
        const input = this.wrapper.find(startDateInput);
        input.simulate("change", { target: { value } });
    };

    public setEndDate = (value: string) => {
        const input = this.wrapper.find(endDateInput);
        input.simulate("change", { target: { value } });
    };

    public setStartTime = (value: string) => {
        const input = this.wrapper.find(startTimeInput);
        input.simulate("change", { target: { value } }).simulate("blur");
    };

    public setEndTime = (value: string) => {
        const input = this.wrapper.find(endTimeInput);
        input.simulate("change", { target: { value } }).simulate("blur");
    };

    public getStartDate = (): string => {
        const input = this.wrapper.find(startDateInput);
        return input.prop("value").toString();
    };

    public getEndDate = (): string => {
        const input = this.wrapper.find(endDateInput);
        return input.prop("value").toString();
    };

    public getStartTime = (): string => {
        const input = this.wrapper.find(startTimeInput);
        return input.prop("value").toString();
    };

    public getEndTime = (): string => {
        const input = this.wrapper.find(endTimeInput);
        return input.prop("value").toString();
    };

    public isVisible = () => {
        const picker = this.wrapper.find(rangePicker);
        return picker.exists();
    };

    public isTimeVisible = () => {
        const pickerFrom = this.wrapper.find(startTimeInput);
        const pickerTo = this.wrapper.find(endTimeInput);
        return pickerFrom.exists() && pickerTo.exists();
    };

    public isErrorVisible = () => {
        return this.wrapper.find(error).exists();
    };
}
