// (C) 2020-2023 GoodData Corporation
import React from "react";
import cx from "classnames";
import DefaultNativeListener from "react-native-listener";
import noop from "lodash/noop.js";
import { defaultImport } from "default-import";

import { ENUM_KEY_CODE } from "../typings/utilities.js";
import { IDomNative, IDomNativeProps } from "../typings/domNative.js";
import { runAutofocus } from "./focus.js";

const NativeListener = defaultImport(DefaultNativeListener);

/**
 * @internal
 */

export interface InputPureProps extends IDomNativeProps {
    className: string;
    clearOnEsc: boolean;
    disabled: boolean;
    hasError: boolean;
    hasWarning: boolean;
    isSearch: boolean;
    isSmall: boolean;
    maxlength: number;
    onChange: (value: string | number, e?: React.ChangeEvent<HTMLInputElement>) => void;
    onEscKeyPress: () => void;
    onEnterKeyPress: () => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
    placeholder: string;
    prefix: string;
    readonly: boolean;
    suffix: string;
    label: string;
    labelPositionTop: boolean;
    value: string | number;
}
/**
 * @internal
 */
export class InputPure extends React.PureComponent<InputPureProps> implements IDomNative {
    public inputNodeRef: HTMLInputElement;
    private autofocusDispatcher: () => void = noop;

    static defaultProps = {
        autofocus: false,
        className: "",
        clearOnEsc: false,
        disabled: false,
        hasError: false,
        hasWarning: false,
        isSearch: false,
        isSmall: false,
        maxlength: 255,
        onChange: noop,
        onEscKeyPress: noop,
        onEnterKeyPress: noop,
        onBlur: noop,
        onFocus: noop,
        placeholder: "",
        prefix: "",
        readonly: false,
        suffix: "",
        label: "",
        labelPositionTop: false,
        value: "",
    };

    componentDidMount(): void {
        const { autofocus } = this.props;
        this.autofocusDispatcher = runAutofocus(this.inputNodeRef, autofocus);
    }

    componentWillUnmount(): void {
        this.autofocusDispatcher();
    }

    componentDidUpdate(prevProps: Readonly<InputPureProps>) {
        if (prevProps.autofocus !== this.props.autofocus) {
            this.autofocusDispatcher();
            this.autofocusDispatcher = runAutofocus(this.inputNodeRef, this.props.autofocus);
        }
    }

    onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.props.onChange((e.target as HTMLInputElement).value, e);
    };

    onKeyPress = (e: React.KeyboardEvent): void => {
        switch (e.keyCode) {
            case ENUM_KEY_CODE.KEY_CODE_ESCAPE:
                if (this.props.clearOnEsc) {
                    this.onClear();
                }
                this.props.onEscKeyPress();
                break;
            case ENUM_KEY_CODE.KEY_CODE_ENTER:
                this.props.onEnterKeyPress();
                break;
            default:
                break;
        }
    };

    onClear = (e?: React.ChangeEvent<HTMLInputElement>): void => {
        this.props.onChange("", e);
    };

    getLabelClassNames(className: string): string {
        return cx(
            {
                "gd-input": true,
                "gd-input-small": this.props.isSmall,
                "gd-input-search": this.props.isSearch,
                "gd-input-with-prefix": !!this.props.prefix,
                "gd-input-with-suffix": !!this.props.suffix,
                "gd-input-with-label": !!this.props.label,
                "gd-input-label-top": this.props.labelPositionTop,
                "has-error": this.props.hasError,
                "has-warning": this.props.hasWarning,
                "is-disabled": this.props.disabled,
            },
            className,
        );
    }

    getInputClassNames(): string {
        return cx({
            "gd-input-field": true,
            "gd-input-field-small": this.props.isSmall,
        });
    }

    renderPrefix(prefix: string): React.ReactNode {
        return prefix ? (
            <span className="gd-input-prefix" aria-label="Input prefix">
                {prefix}
            </span>
        ) : (
            false
        );
    }

    renderSuffix(suffix: string): React.ReactNode {
        return suffix ? (
            <span className="gd-input-suffix" aria-label="Input suffix">
                {suffix}
            </span>
        ) : (
            false
        );
    }

    renderLabel(label: string): React.ReactNode {
        return label ? <span className="gd-input-label">{label}</span> : false;
    }

    renderSearch(isSearch: boolean): React.ReactNode {
        return isSearch ? <span className="gd-input-icon gd-icon-search" /> : false;
    }

    renderClearIcon(clearOnEsc: boolean): React.ReactNode {
        return clearOnEsc && (this.props.value as string).length > 0 ? (
            // react events use delegation and don't bubble, click on clear needs to be kept local
            // to avoid handling by overlay close handler and others
            <NativeListener onClick={this.onClear}>
                <span className="gd-input-icon-clear gd-icon-clear s-input-clear" aria-label="Input clear" />
            </NativeListener>
        ) : (
            false
        );
    }

    render() {
        const {
            className,
            clearOnEsc,
            disabled,
            isSearch,
            placeholder,
            prefix,
            readonly,
            suffix,
            label,
            maxlength,
            value,
            onBlur,
            onFocus,
        } = this.props;

        return (
            <label className={this.getLabelClassNames(className)}>
                {this.renderLabel(label)}
                <div className="gd-input-wrapper">
                    <input
                        ref={(ref) => {
                            this.inputNodeRef = ref;
                        }}
                        className={this.getInputClassNames()}
                        disabled={disabled}
                        maxLength={maxlength}
                        onChange={this.onChange}
                        onBlur={onBlur}
                        onFocus={onFocus}
                        onKeyDown={this.onKeyPress}
                        placeholder={placeholder}
                        readOnly={readonly}
                        value={value}
                    />
                    {this.renderSearch(isSearch)}
                    {this.renderClearIcon(clearOnEsc)}
                    {this.renderPrefix(prefix)}
                    {this.renderSuffix(suffix)}
                </div>
            </label>
        );
    }

    focus(options?: { preventScroll?: boolean }): void {
        if (this.inputNodeRef) {
            this.inputNodeRef.focus(options);
        }
    }
}
