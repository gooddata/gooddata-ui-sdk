// (C) 2026 GoodData Corporation

/**
 * @internal
 */
export const DEFAULT_TOOLTIP_Z_INDEX = 3005;

/**
 * @internal
 */
export interface ITooltipZIndexSources {
    configZIndex?: number;
    containingOverlayZIndex?: number;
    hostDefaultZIndex?: number;
}

/**
 * Resolves the z-index of the tooltip container that Highcharts appends to document.body.
 *
 * @remarks
 * Explicit chart config wins, then one above the containing overlay, then the host default
 * and finally {@link DEFAULT_TOOLTIP_Z_INDEX}.
 *
 * @internal
 */
export function resolveTooltipZIndex({
    configZIndex,
    containingOverlayZIndex,
    hostDefaultZIndex,
}: ITooltipZIndexSources): number {
    if (configZIndex !== undefined) {
        return configZIndex;
    }
    if (containingOverlayZIndex !== undefined) {
        return containingOverlayZIndex + 1;
    }
    return hostDefaultZIndex ?? DEFAULT_TOOLTIP_Z_INDEX;
}
