// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { useId } from "../../utils/useId.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

import { type IChipActionButtonProps } from "./types.js";

const { e } = bem("gd-ui-kit-chip");

export function ChipActionButton({
    onAction,
    onActionKeyDown,
    actionAriaLabel,
    actionAriaDescribedBy,
    actionIcon = "ellipsisVertical",
    dataTestId,
    tooltip,
}: IChipActionButtonProps) {
    const tooltipId = useId();

    const button = useMemo(() => {
        return (
            <button
                data-testid={dataTestId ? `${dataTestId}-action-button` : undefined}
                aria-describedby={
                    [actionAriaDescribedBy, tooltip ? tooltipId : undefined].filter(Boolean).join(" ") ||
                    undefined
                }
                aria-label={actionAriaLabel}
                className={e("action")}
                onClick={onAction}
                onKeyDown={onActionKeyDown}
            >
                <span className={e("icon-action")}>
                    <UiIcon type={actionIcon} color="complementary-6" size={14} />
                </span>
            </button>
        );
    }, [
        actionAriaDescribedBy,
        actionIcon,
        onActionKeyDown,
        actionAriaLabel,
        onAction,
        dataTestId,
        tooltip,
        tooltipId,
    ]);

    if (tooltip) {
        return (
            <UiTooltip
                offset={10}
                id={tooltipId}
                anchor={button}
                content={tooltip}
                hoverOpenDelay={500}
                triggerBy={["hover", "focus"]}
            />
        );
    }

    return button;
}
