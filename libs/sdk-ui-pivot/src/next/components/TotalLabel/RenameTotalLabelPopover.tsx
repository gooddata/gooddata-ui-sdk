// (C) 2025-2026 GoodData Corporation

import { useState } from "react";

import { type IntlShape } from "react-intl";

import { Button, Input, Overlay, UiFocusTrap } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../locales.js";

const MAX_LABEL_LENGTH = 255;

export interface IRenameTotalLabelPopoverProps {
    intl: IntlShape;
    anchor: HTMLElement;
    /** Current custom label (alias), or empty string when none is set. */
    currentLabel: string;
    /** Localized default function-name label, shown as the input placeholder. */
    defaultLabel: string;
    /** Called with the new label, or `undefined` to reset to the default. */
    onSave: (newLabel: string | undefined) => void;
    onCancel: () => void;
}

/**
 * Small popover anchored to the selected total. Holds a label input (with the default label as
 * placeholder fallback), plus Reset to default / Cancel / Save controls. Saving an empty value is
 * treated as a reset to the default label.
 */
export function RenameTotalLabelPopover({
    intl,
    anchor,
    currentLabel,
    defaultLabel,
    onSave,
    onCancel,
}: IRenameTotalLabelPopoverProps) {
    const [value, setValue] = useState<string>(currentLabel);

    const save = () => {
        const trimmed = value.trim();
        onSave(trimmed.length > 0 ? trimmed : undefined);
    };

    return (
        <Overlay
            className="overlay"
            alignTo={anchor}
            alignPoints={[{ align: "bl tl" }, { align: "tl bl" }, { align: "br tr" }]}
            closeOnOutsideClick
            closeOnParentScroll
            closeOnEscape
            onClose={onCancel}
        >
            <UiFocusTrap
                root={
                    <div
                        className="gd-pivot-table-rename-total-popover s-pivot-table-rename-total-popover"
                        role="dialog"
                        aria-label={intl.formatMessage(messages["renameTotalLabel"])}
                    />
                }
            >
                <Input
                    className="s-rename-total-label-input"
                    value={value}
                    placeholder={defaultLabel}
                    autofocus
                    isSmall
                    maxlength={MAX_LABEL_LENGTH}
                    accessibilityConfig={{ ariaLabel: intl.formatMessage(messages["renameTotalLabel"]) }}
                    onChange={(newValue) => setValue(String(newValue))}
                    onEnterKeyPress={save}
                    onEscKeyPress={onCancel}
                />
                <div className="gd-pivot-table-rename-total-popover-buttons">
                    <Button
                        className="gd-button-link s-rename-total-reset"
                        value={intl.formatMessage(messages["resetTotalLabel"])}
                        onClick={() => onSave(undefined)}
                    />
                    <Button
                        className="gd-button-secondary s-rename-total-cancel"
                        value={intl.formatMessage(messages["cancel"])}
                        onClick={onCancel}
                    />
                    <Button
                        className="gd-button-action s-rename-total-save"
                        value={intl.formatMessage(messages["save"])}
                        onClick={save}
                    />
                </div>
            </UiFocusTrap>
        </Overlay>
    );
}
