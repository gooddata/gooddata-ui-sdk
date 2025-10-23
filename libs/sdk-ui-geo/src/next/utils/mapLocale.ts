// (C) 2025 GoodData Corporation

import { IntlShape } from "react-intl";

/**
 * MapLibre locale configuration for cooperative gestures
 *
 * @internal
 */
export interface IMapLibreLocale {
    "ScrollZoomBlocker.CtrlMessage": string;
    "ScrollZoomBlocker.CmdMessage": string;
    "TouchPanBlocker.Message": string;
}

/**
 * Generate MapLibre locale configuration with translated messages
 *
 * @remarks
 * Creates locale object for MapLibre's cooperative gestures feature.
 * Uses react-intl to format localized messages for scroll zoom and touch pan blockers.
 * Detects platform to provide appropriate modifier key (Ctrl vs ⌘).
 *
 * @param intl - react-intl instance for message formatting
 * @returns MapLibre locale configuration object
 *
 * @internal
 */
export function generateMapLibreLocale(intl: IntlShape): IMapLibreLocale {
    return {
        "ScrollZoomBlocker.CtrlMessage": intl.formatMessage(
            { id: "geochart.scroll.zoom.blocker" },
            { button: "ctrl" },
        ),
        "ScrollZoomBlocker.CmdMessage": intl.formatMessage(
            { id: "geochart.scroll.zoom.blocker" },
            { button: "⌘" },
        ),
        "TouchPanBlocker.Message": intl.formatMessage({ id: "geochart.touch.pan.blocker" }),
    };
}
