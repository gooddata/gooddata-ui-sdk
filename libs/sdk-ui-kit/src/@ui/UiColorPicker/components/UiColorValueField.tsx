// (C) 2026 GoodData Corporation

import { type RefObject, useState } from "react";

import { UiButton } from "../../UiButton/UiButton.js";
import { UiDropdown } from "../../UiDropdown/UiDropdown.js";
import { UiListbox } from "../../UiListbox/UiListbox.js";
import { UiTextInput } from "../../UiTextInput/UiTextInput.js";
import {
    COLOR_NOTATIONS,
    type ColorNotation,
    type IColorPickerValue,
    canApplyColorPickerValueWhileTyping,
    formatColorPickerValue,
    parseColorPickerValue,
} from "../colorValue.js";

interface IColorValueFieldProps {
    value: IColorPickerValue;
    onChange: (value: IColorPickerValue) => void;
    notation: ColorNotation;
    onNotationChange: (notation: ColorNotation) => void;
    label: string;
    notationLabel: string;
}

export function UiColorValueField({
    value,
    onChange,
    notation,
    onNotationChange,
    label,
    notationLabel,
}: IColorValueFieldProps) {
    // Held only while the field is being typed into: rendering the value it last parsed to would
    // fight the typing character by character.
    const [draft, setDraft] = useState<string>();

    const type = (text: string) => {
        setDraft(text);
        const parsed = parseColorPickerValue(text, value);
        if (parsed && canApplyColorPickerValueWhileTyping(text)) {
            onChange(parsed);
        }
    };

    // What was only typed through is applied once the typing stops.
    const settle = () => {
        const parsed = draft === undefined ? undefined : parseColorPickerValue(draft, value);
        if (parsed) {
            onChange(parsed);
        }
        setDraft(undefined);
    };

    const items = COLOR_NOTATIONS.map((option) => ({
        type: "interactive" as const,
        id: option,
        stringTitle: option.toUpperCase(),
        data: option,
    }));

    return (
        <div className="gd-ui-kit-color-picker__value">
            <UiTextInput
                value={draft ?? formatColorPickerValue(value, notation)}
                onChange={type}
                onBlur={settle}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        settle();
                    }
                }}
                isError={draft !== undefined && parseColorPickerValue(draft, value) === undefined}
                accessibilityConfig={{ ariaLabel: label }}
                dataTestId="ui-color-picker-value"
            />
            <UiDropdown
                closeOnEscape
                width="auto"
                accessibilityConfig={{ triggerRole: "combobox", popupRole: "listbox" }}
                renderButton={({ ref, isOpen, toggleDropdown, ariaAttributes }) => (
                    <UiButton
                        ref={ref as RefObject<HTMLButtonElement>}
                        size="small"
                        variant="secondary"
                        label={notation.toUpperCase()}
                        iconAfter={isOpen ? "navigateUp" : "navigateDown"}
                        disableIconAnimation
                        onClick={toggleDropdown}
                        accessibilityConfig={{ ariaLabel: notationLabel, ...ariaAttributes }}
                    />
                )}
                renderBody={({ closeDropdown, ariaAttributes }) => (
                    <UiListbox
                        items={items}
                        selectedItemId={notation}
                        ariaAttributes={{ ...ariaAttributes, "aria-label": notationLabel }}
                        isCompact
                        onSelect={(item) => onNotationChange(item.data)}
                        onClose={closeDropdown}
                    />
                )}
            />
        </div>
    );
}
