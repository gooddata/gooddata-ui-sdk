// (C) 2020-2026 GoodData Corporation

import {
    type AriaAttributes,
    type ChangeEvent,
    type FocusEvent,
    type KeyboardEvent,
    type MouseEvent,
    PureComponent,
    type ReactNode,
} from "react";

import cx from "classnames";
import { v4 as uuid } from "uuid";

import { runAutofocus } from "./focus.js";
import { type IconType } from "../@ui/@types/icon.js";
import { UiIconButton } from "../@ui/UiIconButton/UiIconButton.js";
import { type IAccessibilityConfigBase } from "../typings/accessibility.js";
import { type IDomNative, type IDomNativeProps } from "../typings/domNative.js";
import { ENUM_KEY_CODE } from "../typings/utilities.js";

/**
 * @internal
 */
export interface IInputPureAccessibilityConfig extends IAccessibilityConfigBase {
    prefixAriaLabel?: string;
    suffixAriaLabel?: string;
    ariaInvalid?: AriaAttributes["aria-invalid"];
}

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
    onChange?: (value: string | number, e?: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    onEscKeyPress?: (e: KeyboardEvent) => void;
    onEnterKeyPress?: () => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
    onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
    placeholder?: string;
    prefix?: string;
    readonly?: boolean;
    suffix?: string;
    label?: ReactNode;
    labelPositionTop?: boolean;
    value?: string | number;
    id?: string;
    name?: string;
    type?: string;
    required?: boolean;
    accessibilityType?: string;
    accessibilityConfig?: IInputPureAccessibilityConfig;
    autocomplete?: string;
    iconButton?: IconType;
    onIconButtonClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    iconButtonLabel?: string;
    dataTestId?: string;
}
/**
 * @internal
 */
export class InputPure extends PureComponent<InputPureProps> implements IDomNative {
    public inputNodeRef: HTMLInputElement | null = null;
    private autofocusDispatcher: () => void = () => {};
    private readonly a11yIdBase = uuid();

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
        onChange: (..._args: unknown[]) => {},
        onEscKeyPress: (..._args: unknown[]) => {},
        onEnterKeyPress: (..._args: unknown[]) => {},
        onBlur: (..._args: unknown[]) => {},
        onFocus: (..._args: unknown[]) => {},
        placeholder: "",
        prefix: "",
        readonly: false,
        suffix: "",
        label: "",
        labelPositionTop: false,
        value: "",
    };

    override componentDidMount(): void {
        const { autofocus } = this.props;
        this.autofocusDispatcher = runAutofocus(this.inputNodeRef, autofocus ?? false);
    }

    override componentWillUnmount(): void {
        this.autofocusDispatcher();
    }

    override componentDidUpdate(prevProps: Readonly<InputPureProps>) {
        if (prevProps.autofocus !== this.props.autofocus) {
            this.autofocusDispatcher();
            this.autofocusDispatcher = runAutofocus(this.inputNodeRef, this.props.autofocus ?? false);
        }
    }

    onChange = (e: ChangeEvent<HTMLInputElement>): void => {
        this.props.onChange?.((e.target as HTMLInputElement).value, e);
    };

    onKeyPress = (e: KeyboardEvent): void => {
        switch (e.keyCode) {
            case ENUM_KEY_CODE.KEY_CODE_ESCAPE:
                if (this.props.clearOnEsc) {
                    e.stopPropagation();
                    this.onClear();
                }
                this.props.onEscKeyPress?.(e);
                break;
            case ENUM_KEY_CODE.KEY_CODE_ENTER:
                this.props.onEnterKeyPress?.();
                break;
            default:
                break;
        }
    };

    onClear = (e?: ChangeEvent<HTMLInputElement>): void => {
        this.props.onChange?.("", e);
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

    private getA11yIdBase(): string {
        return this.props.id ?? this.a11yIdBase;
    }

    private getPrefixA11yId(): string {
        return `${this.getA11yIdBase()}-a11y-prefix`;
    }

    private getSuffixA11yId(): string {
        return `${this.getA11yIdBase()}-a11y-suffix`;
    }

    renderPrefix(prefix: string, ariaLabel?: string): ReactNode {
        return prefix ? (
            <>
                <span className="gd-input-prefix" aria-hidden="true">
                    {prefix}
                </span>
                {ariaLabel ? (
                    <span className="sr-only" id={this.getPrefixA11yId()}>
                        {ariaLabel}
                    </span>
                ) : null}
            </>
        ) : (
            false
        );
    }

    renderSuffix(suffix: string, ariaLabel?: string): ReactNode {
        return suffix ? (
            <>
                <span className="gd-input-suffix" aria-hidden="true">
                    {suffix}
                </span>
                {ariaLabel ? (
                    <span className="sr-only" id={this.getSuffixA11yId()}>
                        {ariaLabel}
                    </span>
                ) : null}
            </>
        ) : (
            false
        );
    }

    renderLabel(label: ReactNode): ReactNode {
        return label ? <span className="gd-input-label">{label}</span> : false;
    }

    renderSearch(isSearch: boolean): ReactNode {
        return isSearch ? <span className="gd-input-icon gd-icon-search" /> : false;
    }

    renderClearIcon(clearOnEsc: boolean): ReactNode {
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
        onIconButtonClick: (e: MouseEvent<HTMLButtonElement>) => void,
    ): ReactNode {
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

    getAriaDescribedBy(): string | undefined {
        const { prefix, suffix, accessibilityConfig } = this.props;

        const describedBy = [
            prefix && accessibilityConfig?.prefixAriaLabel ? this.getPrefixA11yId() : undefined,
            suffix && accessibilityConfig?.suffixAriaLabel ? this.getSuffixA11yId() : undefined,
            accessibilityConfig?.ariaDescribedBy,
        ]
            .filter(Boolean)
            .join(" ")
            .trim();

        return describedBy.length ? describedBy : undefined;
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
            dataTestId,
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
                    role={accessibilityConfig?.role}
                    aria-label={accessibilityConfig?.ariaLabel ?? undefined}
                    aria-describedby={this.getAriaDescribedBy()}
                    aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                    aria-expanded={accessibilityConfig?.ariaExpanded}
                    aria-controls={accessibilityConfig?.ariaControls}
                    aria-activedescendant={accessibilityConfig?.ariaActiveDescendant}
                    aria-readonly={readonly || undefined}
                    aria-autocomplete={accessibilityConfig?.ariaAutocomplete}
                    aria-invalid={accessibilityConfig?.ariaInvalid}
                    autoComplete={isSearch ? "off" : autocomplete}
                    data-testid={dataTestId}
                />
                {this.renderSearch(isSearch ?? false)}
                {this.renderClearIcon(clearOnEsc ?? false)}
                {this.renderPrefix(prefix ?? "", accessibilityConfig?.prefixAriaLabel)}
                {this.renderSuffix(suffix ?? "", accessibilityConfig?.suffixAriaLabel)}
                {this.renderIconButton(iconButton!, iconButtonLabel ?? "", onIconButtonClick!)}
            </div>
        );
    }

    override render() {
        const { className, label } = this.props;

        return label ? (
            <label className={this.getLabelClassNames(className ?? "")}>
                {this.renderLabel(label)}
                {this.renderInput()}
            </label>
        ) : (
            <div className={this.getLabelClassNames(className ?? "")}>{this.renderInput()}</div>
        );
    }

    focus(options?: { preventScroll?: boolean }): void {
        if (this.inputNodeRef) {
            this.inputNodeRef.focus(options);
        }
    }
}
