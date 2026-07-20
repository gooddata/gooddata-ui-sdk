// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type ReactNode } from "react";

import { useIntl } from "react-intl";

import { DashboardParameterModeValues, type IdentifierRef, type ParameterValue } from "@gooddata/sdk-model";
import {
    Dropdown,
    type OverlayPositionType,
    ParameterControl,
    UiChip,
    UiTooltip,
    isActionKey,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

import { type IAutomationParameter } from "../automationParameters.js";

/**
 * @internal
 */
export interface IAutomationParameterProps {
    parameter: IAutomationParameter;
    onChange?: (ref: IdentifierRef, value: ParameterValue) => void;
    onDelete?: (ref: IdentifierRef) => void;
    overlayPositionType?: OverlayPositionType;
    isReadOnly?: boolean;
}

/**
 * Workspace parameter as an editable chip in automation dialogs.
 *
 * @internal
 */
export function AutomationParameter({
    parameter,
    onChange,
    onDelete,
    overlayPositionType,
    isReadOnly,
}: IAutomationParameterProps): ReactNode {
    const intl = useIntl();
    const { ref, title, value, mode, definition } = parameter;
    const testId = `automation-parameter-${ref.identifier}`;
    const label = intl.formatMessage({ id: "dialogs.automation.parameters.chip" }, { title, value });
    const lockedTooltip = intl.formatMessage({ id: "dialogs.automation.filters.lockedTooltip" });
    const deleteAriaLabel = intl.formatMessage({ id: "dialogs.automation.filters.deleteAriaLabel" });
    const tooltipId = useIdPrefixed("automation-parameter-tooltip");
    const valueInputId = useIdPrefixed("parameter-value-input");

    if (isReadOnly) {
        // `isDisabled` renders a real disabled button — unfocusable, so keyboard users can't edit or
        // delete. No lock icon/tooltip: unlike author-`READONLY` this chip is only frozen because
        // persistence is off, so it must not read as author-locked.
        return (
            <UiChip
                label={label}
                iconBefore="parameter"
                isDisabled
                isExpandable={false}
                dataTestId={testId}
            />
        );
    }

    if (mode === DashboardParameterModeValues.READONLY) {
        return (
            <UiChip
                label={label}
                iconBefore="parameter"
                isLocked
                isExpandable={false}
                dataTestId={testId}
                renderChipContent={(content: ReactNode) => (
                    <UiTooltip
                        id={tooltipId}
                        arrowPlacement="top-start"
                        content={lockedTooltip}
                        triggerBy={["hover", "focus"]}
                        anchor={content}
                        anchorWrapperStyles={{ display: "flex", width: "100%", height: "100%", minWidth: 0 }}
                    />
                )}
            />
        );
    }

    return (
        <Dropdown
            overlayPositionType={overlayPositionType}
            autofocusOnOpen
            initialFocus={valueInputId}
            closeOnEscape
            renderButton={({ isOpen, toggleDropdown, accessibilityConfig }) => (
                <UiChip
                    label={label}
                    iconBefore="parameter"
                    isActive={isOpen}
                    isDeletable
                    onClick={() => toggleDropdown()}
                    onDelete={() => onDelete?.(ref)}
                    dataTestId={testId}
                    accessibilityConfig={{
                        ...accessibilityConfig,
                        popupType: "dialog",
                        deleteAriaLabel: `${deleteAriaLabel} ${title}`,
                    }}
                    onDeleteKeyDown={(event: KeyboardEvent) => {
                        if (isActionKey(event)) {
                            event.stopPropagation();
                        }
                    }}
                />
            )}
            renderBody={({ closeDropdown, ariaAttributes }) => (
                <ParameterControl
                    name={title}
                    definition={definition}
                    value={value}
                    inputId={valueInputId}
                    ariaAttributes={ariaAttributes}
                    onApply={(next) => {
                        onChange?.(ref, next);
                        closeDropdown();
                    }}
                    onCancel={closeDropdown}
                />
            )}
        />
    );
}
