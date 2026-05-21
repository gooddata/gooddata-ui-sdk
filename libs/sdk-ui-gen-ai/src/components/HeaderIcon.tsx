// (C) 2024-2026 GoodData Corporation

import { type IconType, type TooltipArrowPlacement, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

type HeaderIconProps = {
    icon: IconType;
    tooltip?: string;
    onClick?: () => void;
    disabled?: boolean;
    arrowPlacement?: TooltipArrowPlacement;
};

export function HeaderIcon({ tooltip, icon, onClick, disabled, arrowPlacement }: HeaderIconProps) {
    return (
        <div>
            <UiTooltip
                arrowPlacement={arrowPlacement ?? "top-start"}
                hoverOpenDelay={100}
                disabled={!tooltip}
                triggerBy={["focus", "hover"]}
                anchor={
                    <UiIconButton
                        icon={icon}
                        size="medium"
                        isDisabled={disabled}
                        onClick={disabled ? undefined : onClick}
                        accessibilityConfig={{
                            ariaLabel: tooltip,
                        }}
                        variant="tertiary"
                    />
                }
                content={tooltip}
            />
        </div>
    );
}
