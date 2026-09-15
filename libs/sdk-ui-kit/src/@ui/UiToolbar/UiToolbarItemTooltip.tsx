// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { UiTooltip } from "../UiTooltip/UiTooltip.js";

import {
    TOOLBAR_TOOLTIP_CLOSE_DELAY,
    TOOLBAR_TOOLTIP_OFFSET,
    TOOLBAR_TOOLTIP_OPEN_DELAY,
} from "./constants.js";
import { useUiToolbarContextOptional } from "./context.js";

export interface IUiToolbarItemTooltipProps {
    content: ReactNode;
    children: ReactNode;
    /**
     * Hides the tooltip, for example while the item's popup is open.
     */
    isDisabled?: boolean;
}

/**
 * Tooltip of a toolbar item. It is visual only: the item keeps its own accessible name.
 */
export function UiToolbarItemTooltip({ content, children, isDisabled = false }: IUiToolbarItemTooltipProps) {
    const toolbar = useUiToolbarContextOptional();

    return (
        <UiTooltip
            anchor={children}
            content={content}
            triggerBy={["hover", "focus"]}
            arrowPlacement={toolbar?.tooltipArrowPlacement ?? "top"}
            offset={TOOLBAR_TOOLTIP_OFFSET}
            hoverOpenDelay={TOOLBAR_TOOLTIP_OPEN_DELAY}
            hoverCloseDelay={TOOLBAR_TOOLTIP_CLOSE_DELAY}
            delayGroup={toolbar !== null}
            closeOnAnchorClick
            accessibilityHidden
            component="span"
            inlineAnchor
            disabled={isDisabled}
        />
    );
}
