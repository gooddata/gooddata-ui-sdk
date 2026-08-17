// (C) 2020-2026 GoodData Corporation

import {
    type AriaAttributes,
    type ChangeEvent,
    type FocusEvent,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
} from "react";

import cx from "classnames";
import { v4 as uuid } from "uuid";

import { type IconType } from "../@ui/@types/icon.js";
import { UiIconButton } from "../@ui/UiIconButton/UiIconButton.js";
import { type IAccessibilityConfigBase } from "../typings/accessibility.js";
import { type IDomNative, type IDomNativeProps } from "../typings/domNative.js";
import { ENUM_KEY_CODE } from "../typings/utilities.js";

import { runAutofocus } from "./focus.js";

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

export interface IInputPureProps extends IDomNativeProps {
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
 * Imperative handle exposed by {@link InputPure}.
 *
 * `inputNodeRef` is the native `<input>` element - consumers chain `Input.inputNodeRef.inputNodeRef`
 * down to it, so it has to stay the DOM node and not the component instance.
 *
 * @internal
 */
export interface IInputPureHandle extends IDomNative {
    inputNodeRef: HTMLInputElement | null;
}

/**
 * Defaults shared with the `Input` wrapper, which re-exposes them as its own `defaultProps`.
 * Keep in sync with the destructuring defaults in {@link InputPure}.
 *
 * @internal
 */
export const inputPureDefaultProps = {
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

/**
 * @internal
 */
export const InputPure = forwardRef<IInputPureHandle, IInputPureProps>(function InputPure(props, ref) {
    const {
        accessibilityConfig,
        autocomplete,
        autofocus = false,
        className = "",
        clearOnEsc = false,
        dataTestId,
        disabled = false,
        hasError = false,
        hasWarning = false,
        iconButton,
        iconButtonLabel,
        id,
        isSearch = false,
        isSmall = false,
        label = "",
        labelPositionTop = false,
        maxlength = 255,
        name,
        onBlur = (..._args: unknown[]) => {},
        onChange = (..._args: unknown[]) => {},
        onEnterKeyPress = (..._args: unknown[]) => {},
        onEscKeyPress = (..._args: unknown[]) => {},
        onFocus = (..._args: unknown[]) => {},
        onIconButtonClick,
        onKeyDown,
        placeholder = "",
        prefix = "",
        readonly = false,
        required,
        suffix = "",
        type,
        value = "",
    }: IInputPureProps = props;

    const inputRef = useRef<HTMLInputElement | null>(null);
    const autofocusDispatcher = useRef<() => void>(() => {});
    const a11yIdBase = useRef(uuid()).current;

    useEffect(() => {
        autofocusDispatcher.current = runAutofocus(inputRef.current, autofocus);
        // read through the ref rather than closing over the disposer: `onClear` may have replaced it
        // with a newer autofocus loop, and that is the one which has to be cancelled here
        return () => autofocusDispatcher.current();
    }, [autofocus]);

    useImperativeHandle(
        ref,
        () => ({
            get inputNodeRef() {
                return inputRef.current;
            },
            focus(options?: { preventScroll?: boolean }) {
                inputRef.current?.focus(options);
            },
        }),
        [],
    );

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        onChange((e.target as HTMLInputElement).value, e);
    };

    const onClear = (e?: ChangeEvent<HTMLInputElement>): void => {
        onChange("", e);
        autofocusDispatcher.current = runAutofocus(inputRef.current, true);
    };

    const onKeyPress = (e: KeyboardEvent): void => {
        switch (e.keyCode) {
            case ENUM_KEY_CODE.KEY_CODE_ESCAPE as number:
                if (clearOnEsc) {
                    e.stopPropagation();
                    onClear();
                }
                onEscKeyPress(e);
                break;
            case ENUM_KEY_CODE.KEY_CODE_ENTER as number:
                onEnterKeyPress();
                break;
            default:
                break;
        }
    };

    const getLabelClassNames = (classNames: string): string => {
        return cx(
            {
                "gd-input": true,
                "gd-input-small": isSmall,
                "gd-input-search": isSearch,
                "gd-input-with-prefix": !!prefix,
                "gd-input-with-suffix": !!suffix,
                "gd-input-with-icon-button": !!iconButton,
                "gd-input-with-label": !!label,
                "gd-input-label-top": labelPositionTop,
                "has-error": hasError,
                "has-warning": hasWarning,
                "is-disabled": disabled,
            },
            classNames,
        );
    };

    const getInputClassNames = (): string => {
        return cx({
            "gd-input-field": true,
            "gd-input-field-small": isSmall,
        });
    };

    const getA11yIdBase = (): string => id ?? a11yIdBase;

    const getPrefixA11yId = (): string => `${getA11yIdBase()}-a11y-prefix`;

    const getSuffixA11yId = (): string => `${getA11yIdBase()}-a11y-suffix`;

    const renderPrefix = (prefixValue: string, ariaLabel?: string): ReactNode => {
        return prefixValue ? (
            <>
                <span className="gd-input-prefix" aria-hidden="true">
                    {prefixValue}
                </span>
                {ariaLabel ? (
                    <span className="sr-only" id={getPrefixA11yId()}>
                        {ariaLabel}
                    </span>
                ) : null}
            </>
        ) : (
            false
        );
    };

    const renderSuffix = (suffixValue: string, ariaLabel?: string): ReactNode => {
        return suffixValue ? (
            <>
                <span className="gd-input-suffix" aria-hidden="true">
                    {suffixValue}
                </span>
                {ariaLabel ? (
                    <span className="sr-only" id={getSuffixA11yId()}>
                        {ariaLabel}
                    </span>
                ) : null}
            </>
        ) : (
            false
        );
    };

    const renderLabel = (labelValue: ReactNode, htmlFor?: string): ReactNode => {
        return labelValue ? (
            <label htmlFor={htmlFor} className="gd-input-label">
                {labelValue}
            </label>
        ) : (
            false
        );
    };

    const renderSearch = (isSearchValue: boolean): ReactNode => {
        return isSearchValue ? <span className="gd-input-icon gd-icon-search" /> : false;
    };

    const renderClearIcon = (clearOnEscValue: boolean): ReactNode => {
        return clearOnEscValue && (value as string).length > 0 ? (
            <button
                type="button"
                className="gd-input-icon-clear gd-icon-clear s-input-clear"
                aria-label="Input clear"
                onClick={(e) => {
                    // react events use delegation and don't bubble, click on clear needs to be kept local
                    // to avoid handling by overlay close handler and others
                    e.stopPropagation();
                    onClear();
                }}
            />
        ) : (
            false
        );
    };

    const renderIconButton = (
        iconButtonValue: IconType,
        iconButtonLabelValue: string,
        onIconButtonClickValue: (e: MouseEvent<HTMLButtonElement>) => void,
    ): ReactNode => {
        return iconButtonValue ? (
            <span className="gd-input-icon-button">
                <UiIconButton
                    icon={iconButtonValue}
                    label={iconButtonLabelValue}
                    size="medium"
                    variant="tertiary"
                    onClick={onIconButtonClickValue}
                    accessibilityConfig={{
                        ariaLabel: iconButtonLabelValue,
                    }}
                />
            </span>
        ) : (
            false
        );
    };

    const getAriaDescribedBy = (): string | undefined => {
        const describedBy = [
            prefix && accessibilityConfig?.prefixAriaLabel ? getPrefixA11yId() : undefined,
            suffix && accessibilityConfig?.suffixAriaLabel ? getSuffixA11yId() : undefined,
            accessibilityConfig?.ariaDescribedBy,
        ]
            .filter(Boolean)
            .join(" ")
            .trim();

        return describedBy.length ? describedBy : undefined;
    };

    const renderInput = () => {
        return (
            <div className="gd-input-wrapper">
                <input
                    ref={inputRef}
                    type={type ?? "text"}
                    id={getA11yIdBase()}
                    name={name}
                    required={required}
                    className={getInputClassNames()}
                    disabled={disabled}
                    maxLength={maxlength}
                    onChange={handleChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    onKeyDown={onKeyDown ?? onKeyPress}
                    placeholder={placeholder}
                    readOnly={readonly}
                    value={value}
                    role={accessibilityConfig?.role}
                    aria-label={accessibilityConfig?.ariaLabel ?? undefined}
                    aria-describedby={getAriaDescribedBy()}
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
                {renderSearch(isSearch)}
                {renderClearIcon(clearOnEsc)}
                {renderPrefix(prefix, accessibilityConfig?.prefixAriaLabel)}
                {renderSuffix(suffix, accessibilityConfig?.suffixAriaLabel)}
                {renderIconButton(iconButton!, iconButtonLabel ?? "", onIconButtonClick!)}
            </div>
        );
    };

    if (label) {
        return (
            <div className={getLabelClassNames(className)}>
                {renderLabel(label, getA11yIdBase())}
                {renderInput()}
            </div>
        );
    }

    return <div className={getLabelClassNames(className)}>{renderInput()}</div>;
});
