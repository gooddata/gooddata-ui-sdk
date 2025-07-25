// (C) 2020-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import noop from "lodash/noop.js";

import { ENUM_KEY_CODE } from "../typings/utilities.js";
import { IDomNative, IDomNativeProps } from "../typings/domNative.js";
import { runAutofocus } from "./focus.js";
import { IAccessibilityConfigBase } from "../typings/accessibility.js";
import { IconType } from "../@ui/@types/icon.js";
import { UiIconButton } from "../@ui/UiIconButton/UiIconButton.js";

/**
 * @internal
 */

export interface InputPureProps extends IDomNativeProps {
    className?: string;
    clearOnEsc?: boolean;
    disabled?: boolean;
    hasError?: boolean;
    hasWarning?: boolean;
    isSearch?: boolean;
    isSmall?: boolean;
    maxlength?: number;
    onChange?: (value: string | number, e?: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    onEscKeyPress?: (e: React.KeyboardEvent) => void;
    onEnterKeyPress?: () => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    placeholder?: string;
    prefix?: string;
    readonly?: boolean;
    suffix?: string;
    label?: React.ReactNode;
    labelPositionTop?: boolean;
    value?: string | number;
    id?: string;
    name?: string;
    type?: string;
    required?: boolean;
    accessibilityType?: string;
    accessibilityConfig?: IAccessibilityConfigBase;
    autocomplete?: string;
    iconButton?: IconType;
    onIconButtonClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    iconButtonLabel?: string;
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
                this.props.onEscKeyPress(e);
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
        this.autofocusDispatcher = runAutofocus(this.inputNodeRef, true);
    };

    getLabelClassNames(className: string): string {
        return cx(
            {
                "gd-input": true,
                "gd-input-small": this.props.isSmall,
                "gd-input-search": this.props.isSearch,
                "gd-input-with-prefix": !!this.props.prefix,
                "gd-input-with-suffix": !!this.props.suffix,
                "gd-input-with-icon-button": !!this.props.iconButton,
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

    renderLabel(label: React.ReactNode): React.ReactNode {
        return label ? <span className="gd-input-label">{label}</span> : false;
    }

    renderSearch(isSearch: boolean): React.ReactNode {
        return isSearch ? <span className="gd-input-icon gd-icon-search" /> : false;
    }

    renderClearIcon(clearOnEsc: boolean): React.ReactNode {
        return clearOnEsc && (this.props.value as string).length > 0 ? (
            <span
                role="button"
                className="gd-input-icon-clear gd-icon-clear s-input-clear"
                aria-label="Input clear"
                onClick={(e) => {
                    // react events use delegation and don't bubble, click on clear needs to be kept local
                    // to avoid handling by overlay close handler and others
                    e.stopPropagation();
                    this.onClear();
                }}
            />
        ) : (
            false
        );
    }

    renderIconButton(
        iconButton: IconType,
        iconButtonLabel: string,
        onIconButtonClick: (e: React.MouseEvent<HTMLButtonElement>) => void,
    ): React.ReactNode {
        return iconButton ? (
            <span className="gd-input-icon-button">
                <UiIconButton
                    icon={iconButton}
                    label={iconButtonLabel}
                    size="medium"
                    variant="tertiary"
                    onClick={onIconButtonClick}
                    accessibilityConfig={{
                        ariaLabel: iconButtonLabel,
                    }}
                />
            </span>
        ) : (
            false
        );
    }

    renderInput() {
        const {
            clearOnEsc,
            disabled,
            isSearch,
            placeholder,
            prefix,
            readonly,
            suffix,
            maxlength,
            value,
            onBlur,
            onFocus,
            id,
            name,
            type,
            required,
            accessibilityConfig,
            autocomplete,
            iconButton,
            iconButtonLabel,
            onIconButtonClick,
        } = this.props;
        return (
            <div className="gd-input-wrapper">
                <input
                    ref={(ref) => {
                        this.inputNodeRef = ref;
                    }}
                    type={type}
                    id={id}
                    name={name}
                    required={required}
                    className={this.getInputClassNames()}
                    disabled={disabled}
                    maxLength={maxlength}
                    onChange={this.onChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    onKeyDown={this.props.onKeyDown ?? this.onKeyPress}
                    placeholder={placeholder}
                    readOnly={readonly}
                    value={value}
                    aria-label={accessibilityConfig?.ariaLabel ?? undefined}
                    aria-describedby={accessibilityConfig?.ariaDescribedBy}
                    aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                    aria-readonly={readonly || undefined}
                    autoComplete={isSearch ? "off" : autocomplete}
                />
                {this.renderSearch(isSearch)}
                {this.renderClearIcon(clearOnEsc)}
                {this.renderPrefix(prefix)}
                {this.renderSuffix(suffix)}
                {this.renderIconButton(iconButton, iconButtonLabel, onIconButtonClick)}
            </div>
        );
    }

    render() {
        const { className, label } = this.props;

        return label ? (
            <label className={this.getLabelClassNames(className)}>
                {this.renderLabel(label)}
                {this.renderInput()}
            </label>
        ) : (
            <div className={this.getLabelClassNames(className)}>{this.renderInput()}</div>
        );
    }

    focus(options?: { preventScroll?: boolean }): void {
        if (this.inputNodeRef) {
            this.inputNodeRef.focus(options);
        }
    }
}
