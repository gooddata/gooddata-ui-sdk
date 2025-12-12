// (C) 2024-2025 GoodData Corporation

import { type IconType, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

type HeaderIconProps = {
    icon: IconType;
    tooltip?: string;
    onClick?: () => void;
    disabled?: boolean;
};

export function HeaderIcon({ tooltip, icon, onClick, disabled }: HeaderIconProps) {
    return (
        <div>
            <UiTooltip
                arrowPlacement="bottom"
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
