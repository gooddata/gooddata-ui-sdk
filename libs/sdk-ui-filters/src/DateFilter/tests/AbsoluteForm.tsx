// (C) 2022-2025 GoodData Corporation
import { fireEvent } from "@testing-library/react";

const rangePicker = ".s-date-range-picker";
const error = ".s-absolute-range-error";
const startDateInput = ".s-date-range-picker-from .s-date-range-picker-input-field";
const endDateInput = ".s-date-range-picker-to .s-date-range-picker-input-field";
const startTimeInput = ".s-date-range-picker-from .s-date-range-picker-input-time .input-text";
const endTimeInput = ".s-date-range-picker-to .s-date-range-picker-input-time .input-text";

export class AbsoluteForm {
    public setStartDate = (value: string) => {
        const input = document.querySelector(startDateInput);
        fireEvent.change(input, { target: { value } });
        fireEvent.blur(input);
    };

    public setEndDate = (value: string) => {
        const input = document.querySelector(endDateInput);
        fireEvent.change(input, { target: { value } });
        fireEvent.blur(input);
    };

    public setStartTime = (value: string) => {
        const input = document.querySelector(startTimeInput);
        fireEvent.change(input, { target: { value } });
        fireEvent.blur(input);
    };

    public setEndTime = (value: string) => {
        const input = document.querySelector(endTimeInput);
        fireEvent.change(input, { target: { value } });
        fireEvent.blur(input);
    };

    public getStartDate = (): string => {
        const input: HTMLInputElement = document.querySelector(startDateInput);
        return input.value;
    };

    public getEndDate = (): string => {
        const input: HTMLInputElement = document.querySelector(endDateInput);
        return input.value;
    };

    public getStartTime = (): string => {
        const input: HTMLInputElement = document.querySelector(startTimeInput);
        return input.value;
    };

    public getEndTime = (): string => {
        const input: HTMLInputElement = document.querySelector(endTimeInput);
        return input.value;
    };

    public isVisible = () => !!document.querySelector(rangePicker);

    public isErrorVisible = () => !!document.querySelector(error);
}
