// (C) 2020-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import NativeListener from "react-native-listener";
import noop from "lodash/noop";

import { ENUM_KEY_CODE } from "../typings/utilities";
import { IDomNative, IDomNativeProps } from "../typings/domNative";
import tryFocus from "./focus";

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
    nativeLikeAutofocus?: boolean;
}
/**
 * @internal
 */
export class InputPure extends React.PureComponent<InputPureProps> implements IDomNative {
    public inputNodeRef: HTMLInputElement;
    private focusTimer: number = -1;
    private focusInterval: number = -1;

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
        const { autofocus, nativeLikeAutofocus } = this.props;

        if (autofocus && !nativeLikeAutofocus) {
            // https://github.com/facebook/react/issues/1791
            this.focusTimer = window.setTimeout(() => this.inputNodeRef && this.inputNodeRef.focus(), 100);
        }
        if (autofocus && nativeLikeAutofocus) {
            this.focusInterval = tryFocus(() => this.inputNodeRef);
        }
    }

    componentWillUnmount(): void {
        window.clearTimeout(this.focusTimer);
        window.clearInterval(this.focusInterval);
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
        return prefix ? <span className="gd-input-prefix">{prefix}</span> : false;
    }

    renderSuffix(suffix: string): React.ReactNode {
        return suffix ? <span className="gd-input-suffix">{suffix}</span> : false;
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
                <span className="gd-input-icon-clear gd-icon-clear s-input-clear" />
            </NativeListener>
        ) : (
            false
        );
    }

    render(): React.ReactNode {
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
