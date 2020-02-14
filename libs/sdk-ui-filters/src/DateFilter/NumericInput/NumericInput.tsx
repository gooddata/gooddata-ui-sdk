// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import isEmpty = require("lodash/isEmpty");
import isNumber = require("lodash/isNumber");
import defaultTo = require("lodash/defaultTo");
import clamp = require("lodash/clamp");

import { ArrowButton } from "./ArrowButton";
import { unless } from "./utils";

type NumericInputValue = number | "" | "-";

const isIntermediateValue = (value: number | string): value is "" | "-" => value === "" || value === "-";

const isNotNumeric = <T extends {}>(value: T | number): value is T => !isEmpty(value) && !isNumber(value);

const UP_ARROW_CODE = 38;
const DOWN_ARROW_CODE = 40;

export class NumericInput extends React.Component<{
    value: NumericInputValue;
    onChange: (value: NumericInputValue) => void;
    placeholder?: string;
    min?: number;
    max?: number;
}> {
    public render(): React.ReactNode {
        const {
            props,
            handleChange,
            handleKeyDown,
            increment,
            decrement,
            isIncrementDisabled,
            isDecrementDisabled,
        } = this;
        return (
            <label className="gd-input gd-input-with-suffix gd-numeric-input">
                <input
                    type="text"
                    className="gd-input-field"
                    value={props.value}
                    placeholder={props.placeholder}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                />
                <ArrowButton
                    arrowDirection="increment"
                    disabled={isIncrementDisabled()}
                    onClick={increment}
                />
                <ArrowButton
                    arrowDirection="decrement"
                    disabled={isDecrementDisabled()}
                    onClick={decrement}
                />
            </label>
        );
    }

    private isIncrementDisabled = () =>
        isNotNumeric(this.props.value) ||
        (this.props.max !== undefined && this.props.value >= this.props.max);

    private isDecrementDisabled = () =>
        isNotNumeric(this.props.value) ||
        (this.props.min !== undefined && this.props.value <= this.props.min);

    private clampToRange = (value: number): number => {
        const { max, min } = this.props;
        const upperBound = defaultTo(max, Infinity);
        const lowerBound = defaultTo(min, -Infinity);
        return clamp(value, lowerBound, upperBound);
    };

    private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isIntermediateValue(e.target.value)) {
            this.props.onChange(e.target.value);
        }
        const parsedValue = Number.parseInt(e.target.value, 10);
        if (Number.isInteger(parsedValue)) {
            this.props.onChange(parsedValue);
        }
    };

    private valueChanger = (delta: number) => () =>
        this.props.onChange(
            isIntermediateValue(this.props.value) ? delta : this.clampToRange(this.props.value + delta),
        );

    // tslint:disable-next-line:member-ordering
    private increment = this.valueChanger(1);
    // tslint:disable-next-line:member-ordering
    private decrement = this.valueChanger(-1);
    // tslint:disable-next-line:member-ordering
    private keyDownHandlers = {
        [UP_ARROW_CODE]: () => unless(this.isIncrementDisabled, this.increment),
        [DOWN_ARROW_CODE]: () => unless(this.isDecrementDisabled, this.decrement),
    };

    private handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const handler = this.keyDownHandlers[e.keyCode];
        if (handler) {
            handler();
        }
    };
}
