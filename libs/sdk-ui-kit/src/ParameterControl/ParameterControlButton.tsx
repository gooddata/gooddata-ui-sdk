// (C) 2026 GoodData Corporation

import { defineMessages, useIntl } from "react-intl";

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
    value: number;
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
    const subtitle = intl.formatMessage(messages.valueSubtitle, { value });

    return (
        <UiControlButton
            title={name}
            subtitle={subtitle}
            isOpen={isActive}
            isDraggable={isDraggable}
            isDragging={isDragging}
            icon={<UiIcon type={warningTooltip ? "warning" : "parameter"} size={16} color="currentColor" />}
            isWarning={!!warningTooltip}
            warningTooltip={warningTooltip}
            dropdownId={dropdownId}
            onClick={onClick}
            className={className}
            data-testid={dataTestId}
        />
    );
}
