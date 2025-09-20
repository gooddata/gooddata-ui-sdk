// (C) 2020-2025 GoodData Corporation

import { ChangeEvent, PureComponent } from "react";

import { isNaN, isNumber, isString } from "lodash-es";

import { InputPure, InputPureProps } from "./InputPure.js";

const isValidNumber = (value: string | number) => isNumber(value) && !isNaN(value);
const isNumberOrString = (value: string | number) =>
    isValidNumber(value) || (isString(value) && value.length);
const toValidValue = (value: string | number) => (isNumberOrString(value) ? value : "");

/**
 * @internal
 */
export interface InputState {
    value: string | number;
}

/**
 * @internal
 */
export class Input extends PureComponent<InputPureProps, InputState> {
    static defaultProps = {
        ...InputPure.defaultProps,
    };
    public inputNodeRef: InputPure;

    constructor(props: InputPureProps) {
        super(props);
        const { value } = props;

        this.state = {
            value: toValidValue(value),
        };
    }

    override UNSAFE_componentWillReceiveProps(nextProps: InputPureProps): void {
        const validValue = toValidValue(nextProps.value);
        if (this.props.value !== validValue) {
            this.valueChanged(validValue);
        }
    }

    onChange = (value: string | number, e?: ChangeEvent<HTMLInputElement>): void => {
        this.valueChanged(value, e);
    };

    valueChanged(value: string | number, e?: ChangeEvent<HTMLInputElement>): void {
        if (this.state.value !== value) {
            this.setState({
                value,
            });

            this.props.onChange(value, e);
        }
    }

    override render() {
        return (
            <InputPure
                {...this.props}
                ref={(ref) => {
                    this.inputNodeRef = ref;
                }}
                onChange={this.onChange}
                value={this.state.value}
            />
        );
    }
}
