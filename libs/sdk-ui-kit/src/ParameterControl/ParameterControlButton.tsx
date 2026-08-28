// (C) 2026 GoodData Corporation

import { defineMessages, useIntl } from "react-intl";

import { type IParameterDefinition, type ParameterValue, getParameterValueTitle } from "@gooddata/sdk-model";

import { UiControlButton } from "../@ui/UiControlButton/UiControlButton.js";
import { UiIcon } from "../@ui/UiIcon/UiIcon.js";

const messages = defineMessages({
    valueSubtitle: { id: "parameter_filter.button.value_label" },
});

/**
 * @internal
 */
export interface IParameterControlButtonProps {
    name: string;
    definition: IParameterDefinition;
    value: ParameterValue;
    isActive: boolean;
    isDraggable?: boolean;
    isDragging?: boolean;
    warningTooltip?: string;
    dropdownId?: string;
    onClick?: () => void;
    className?: string;
    "data-testid"?: string;
}

/**
 * @internal
 */
export function ParameterControlButton({
    name,
    definition,
    value,
    isActive,
    isDraggable,
    isDragging,
    warningTooltip,
    dropdownId,
    onClick,
    className,
    "data-testid": dataTestId,
}: IParameterControlButtonProps) {
    const intl = useIntl();
    const subtitle = intl.formatMessage(messages.valueSubtitle, {
        value: getParameterValueTitle(definition, value),
    });

    return (
        <UiControlButton
            title={name}
            subtitle={subtitle}
            isOpen={isActive}
            isDraggable={isDraggable}
            isDragging={isDragging}
            icon={warningTooltip ? <UiIcon type="warning" size={16} color="currentColor" /> : undefined}
            isWarning={!!warningTooltip}
            warningTooltip={warningTooltip}
            dropdownId={dropdownId}
            onClick={onClick}
            className={className}
            data-testid={dataTestId}
        />
    );
}
