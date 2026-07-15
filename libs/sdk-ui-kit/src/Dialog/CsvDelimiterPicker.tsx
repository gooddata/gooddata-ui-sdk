// (C) 2026 GoodData Corporation

import { useEffect, useState } from "react";

import cx from "classnames";
import { type IntlShape, defineMessages, useIntl } from "react-intl";

import {
    CSV_DELIMITER_PRESETS,
    type CsvDelimiterPreset,
    type CsvDelimiterPresetId,
    type CsvDelimiterValidationError,
} from "@gooddata/sdk-model";
import {
    ValidationContextStore,
    createInvalidDatapoint,
    createInvalidNode,
    useValidationContextValue,
} from "@gooddata/sdk-ui";

import { UiDropdown } from "../@ui/UiDropdown/UiDropdown.js";
import { type IUiMenuInteractiveItem, type IUiMenuInteractiveItemProps } from "../@ui/UiMenu/types.js";
import { UiMenu } from "../@ui/UiMenu/UiMenu.js";
import { DropdownButton } from "../Dropdown/DropdownButton.js";
import { Input } from "../Form/Input.js";
import { useIdPrefixed } from "../utils/useId.js";

const DEFAULT_MENU_MIN_WIDTH = 260;

const messages = defineMessages({
    optionComma: { id: "csvDelimiterPicker.option.comma" },
    optionSemicolon: { id: "csvDelimiterPicker.option.semicolon" },
    optionPipe: { id: "csvDelimiterPicker.option.pipe" },
    optionTab: { id: "csvDelimiterPicker.option.tab" },
    optionCustom: { id: "csvDelimiterPicker.option.custom" },
    customInput: { id: "csvDelimiterPicker.customInput" },
    menuLabel: { id: "csvDelimiterPicker.menuLabel" },
    errorPrefix: { id: "csvDelimiterPicker.validation.errorPrefix" },
    validationSingleCharacter: { id: "csvDelimiterPicker.validation.singleCharacter" },
    validationUnsupported: { id: "csvDelimiterPicker.validation.unsupported" },
});

type CsvDelimiterMenuData = { interactive: CsvDelimiterPreset };

const getPresetLabels = (intl: IntlShape) => ({
    comma: intl.formatMessage(messages.optionComma),
    semicolon: intl.formatMessage(messages.optionSemicolon),
    pipe: intl.formatMessage(messages.optionPipe),
    tab: intl.formatMessage(messages.optionTab),
    custom: intl.formatMessage(messages.optionCustom),
});

const getMenuItems = (
    presetLabels: Record<CsvDelimiterPreset, string>,
): IUiMenuInteractiveItem<CsvDelimiterMenuData>[] => {
    const items: IUiMenuInteractiveItem<CsvDelimiterMenuData>[] = [];
    let id: CsvDelimiterPresetId;
    for (id in CSV_DELIMITER_PRESETS) {
        items.push({
            type: "interactive",
            id,
            stringTitle: presetLabels[id],
            data: id,
        });
    }
    items.push({
        type: "interactive",
        id: "custom",
        stringTitle: presetLabels.custom,
        data: "custom",
    });
    return items;
};

const getButtonLabel = (
    presetLabels: Record<CsvDelimiterPreset, string>,
    selectedPreset: CsvDelimiterPreset,
): string => {
    const label = presetLabels[selectedPreset];
    const preset = selectedPreset === "custom" ? undefined : CSV_DELIMITER_PRESETS[selectedPreset];
    return preset ? `${label} (${preset.previewSymbol})` : label;
};

function CsvDelimiterMenuItem({ item, isFocused }: IUiMenuInteractiveItemProps<CsvDelimiterMenuData>) {
    const preset = item.data === "custom" ? undefined : CSV_DELIMITER_PRESETS[item.data];

    return (
        <div
            className={cx("gd-ui-kit-menu__item", {
                "gd-ui-kit-menu__item--isFocused": isFocused,
                "gd-ui-kit-menu__item--isSelected": !!item.isSelected,
            })}
        >
            <span className="gd-csv-delimiter-picker-label">
                <span>{item.stringTitle}</span>
                {preset ? (
                    <span className="gd-csv-delimiter-picker-preview" aria-hidden="true">
                        {" ("}
                        <span className="gd-csv-delimiter-picker-preview-char">{preset.previewSymbol}</span>
                        {")"}
                    </span>
                ) : null}
            </span>
        </div>
    );
}

/**
 * @internal
 */
export interface ICsvDelimiterPickerValue {
    selectedPreset: CsvDelimiterPreset;
    customDelimiter: string;
}

/**
 * @internal
 */
export interface ICsvDelimiterPickerProps {
    /** Current picker state — use `getCsvDelimiterState` from `@gooddata/sdk-model` to initialize. */
    value: ICsvDelimiterPickerValue;
    /** Called when the user changes the preset or custom delimiter value. */
    onChange: (value: ICsvDelimiterPickerValue) => void;
    /** Validation error to display below the custom input. */
    validationError?: CsvDelimiterValidationError;
    /** If provided, renders a label above the dropdown. */
    label?: string;
    /** Called when Enter is pressed in the custom input. */
    onEnterKeyPress?: () => void;
    /**
     * Layout direction for the dropdown and custom input.
     * - `"column"` (default): dropdown takes full width, custom input stacks below.
     * - `"row"`: dropdown auto-sizes, custom input sits beside it.
     */
    layout?: "row" | "column";
}

/**
 * Reusable CSV delimiter preset picker with dropdown, custom input, and validation.
 *
 * This is a controlled component — the consumer manages state via
 * `getCsvDelimiterState` from `@gooddata/sdk-model` and passes it through props.
 *
 * @internal
 */
export function CsvDelimiterPicker({
    value,
    onChange,
    validationError,
    label,
    onEnterKeyPress,
    layout = "column",
}: ICsvDelimiterPickerProps) {
    const intl = useIntl();
    const { selectedPreset, customDelimiter } = value;

    const buttonId = useIdPrefixed("csv-delimiter-button");
    const errorId = useIdPrefixed("csv-delimiter-error");

    const [isCustomInputDirty, setIsCustomInputDirty] = useState(false);
    const showInlineError = Boolean(validationError) && isCustomInputDirty;

    const errorPrefix = intl.formatMessage(messages.errorPrefix);

    const validationErrorMessage = validationError
        ? validationError === "singleCharacter"
            ? intl.formatMessage(messages.validationSingleCharacter)
            : intl.formatMessage(messages.validationUnsupported)
        : undefined;

    const validationContextValue = useValidationContextValue(createInvalidNode());
    const { setInvalidDatapoints } = validationContextValue;

    // Sync validation errors to ValidationContextStore so the submit button
    // in ConfirmDialogBase always announces them via aria-describedby —
    // when the user focuses the submit button, they should hear why the form
    // can't be submitted, regardless of whether the input is dirty yet.
    useEffect(() => {
        setInvalidDatapoints(() =>
            validationErrorMessage
                ? [
                      createInvalidDatapoint({
                          id: errorId,
                          message: `${errorPrefix} ${validationErrorMessage}`,
                      }),
                  ]
                : [],
        );
    }, [validationErrorMessage, errorPrefix, errorId, setInvalidDatapoints]);

    const presetLabels = getPresetLabels(intl);
    const menuItems = getMenuItems(presetLabels);

    const customInputLabel = intl.formatMessage(messages.customInput);
    const menuAriaLabel = intl.formatMessage(messages.menuLabel);

    return (
        <ValidationContextStore value={validationContextValue}>
            {label ? <label htmlFor={buttonId}>{label}</label> : null}
            <div
                className={cx("gd-csv-delimiter-picker-controls", {
                    "gd-csv-delimiter-picker-controls--column": layout === "column",
                    "gd-csv-delimiter-picker-controls--row": layout === "row",
                })}
            >
                <UiDropdown
                    renderButton={({ isOpen, toggleDropdown, ref, dropdownId }) => (
                        <DropdownButton
                            id={buttonId}
                            className="s-csv-delimiter-dropdown"
                            value={getButtonLabel(presetLabels, selectedPreset)}
                            isOpen={isOpen}
                            onClick={toggleDropdown}
                            buttonRef={ref}
                            dropdownId={dropdownId}
                            accessibilityConfig={{
                                ...(label ? {} : { ariaLabel: menuAriaLabel }),
                                popupType: "listbox",
                            }}
                            isFullWidth={layout === "column"}
                        />
                    )}
                    renderBody={({ closeDropdown, ariaAttributes }) => (
                        <UiMenu
                            items={menuItems.map((item) => ({
                                ...item,
                                isSelected: selectedPreset === item.data,
                            }))}
                            itemDataTestId={(item) => `s-csv-delimiter-${item.id}`}
                            onSelect={(item) => {
                                setIsCustomInputDirty(false);
                                onChange({ selectedPreset: item.data, customDelimiter });
                            }}
                            onClose={closeDropdown}
                            shouldCloseOnSelect
                            InteractiveItem={CsvDelimiterMenuItem}
                            ariaAttributes={{
                                ...ariaAttributes,
                                "aria-label": menuAriaLabel,
                            }}
                            minWidth={DEFAULT_MENU_MIN_WIDTH}
                        />
                    )}
                    autofocusOnOpen
                    fullWidthButton={layout === "column"}
                    closeOnEscape
                    accessibilityConfig={{
                        triggerRole: "button",
                        popupRole: "listbox",
                    }}
                />

                {selectedPreset === "custom" ? (
                    <div className="gd-csv-delimiter-picker-custom-field">
                        <Input
                            className="gd-csv-delimiter-picker-custom-input s-csv-delimiter-custom-input"
                            isSmall
                            value={customDelimiter}
                            onChange={(value) => {
                                setIsCustomInputDirty(true);
                                onChange({ selectedPreset, customDelimiter: String(value) });
                            }}
                            hasError={showInlineError}
                            autocomplete="off"
                            onEnterKeyPress={onEnterKeyPress}
                            accessibilityConfig={{
                                ariaLabel: customInputLabel,
                                ariaInvalid: showInlineError,
                                ariaDescribedBy: showInlineError ? errorId : undefined,
                            }}
                        />
                        {validationErrorMessage ? (
                            <div
                                id={errorId}
                                className={cx("gd-csv-delimiter-picker-error", {
                                    "sr-only": !showInlineError,
                                })}
                            >
                                {errorPrefix} {validationErrorMessage}
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </ValidationContextStore>
    );
}
