// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type ReactNode } from "react";

import { useIntl } from "react-intl";

import { DashboardParameterModeValues, type IdentifierRef } from "@gooddata/sdk-model";
import {
    Dropdown,
    type OverlayPositionType,
    ParameterControlDropdown,
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
    onChange?: (ref: IdentifierRef, value: number) => void;
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
    const { ref, title, value, mode, constraints } = parameter;
    const testId = `automation-parameter-${ref.identifier}`;
    const label = intl.formatMessage({ id: "dialogs.automation.parameters.chip" }, { title, value });
    const lockedTooltip = intl.formatMessage({ id: "dialogs.automation.filters.lockedTooltip" });
    const deleteAriaLabel = intl.formatMessage({ id: "dialogs.automation.filters.deleteAriaLabel" });
    const tooltipId = useIdPrefixed("automation-parameter-tooltip");

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
            renderButton={({ isOpen, toggleDropdown }) => (
                <UiChip
                    label={label}
                    iconBefore="parameter"
                    isActive={isOpen}
                    isDeletable
                    onClick={() => toggleDropdown()}
                    onDelete={() => onDelete?.(ref)}
                    dataTestId={testId}
                    accessibilityConfig={{
                        isExpanded: isOpen,
                        deleteAriaLabel: `${deleteAriaLabel} ${title}`,
                    }}
                    onDeleteKeyDown={(event: KeyboardEvent) => {
                        if (isActionKey(event)) {
                            event.stopPropagation();
                        }
                    }}
                />
            )}
            renderBody={({ closeDropdown }) => (
                <ParameterControlDropdown
                    name={title}
                    value={value}
                    constraints={constraints}
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
