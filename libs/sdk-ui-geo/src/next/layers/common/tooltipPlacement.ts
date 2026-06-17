// (C) 2025-2026 GoodData Corporation

import type { IMapFacade, IPopupFacade, LngLatLike, PopupOptions } from "./mapFacade.js";

// Slack kept between the point and the map edge so the popup isn't flush against it (also absorbs
// the popup's own offset from the point — the exact value isn't load-bearing).
const EDGE_MARGIN = 24;
// Minimum tooltip height. On rare very short charts (< ~208px) it can exceed the available room and
// slightly overflow — accepted, as clamping tighter would leave an unreadable sliver.
const MIN_CONTENT_HEIGHT = 80;
const CLIPPED_CLASS = "gd-viz-tooltip-content--clipped";

interface ITooltipPlacement {
    anchor: NonNullable<PopupOptions["anchor"]>;
    maxHeight: number;
}

// A fixed anchor stops MapLibre from recomputing (and flipping) it when async content resizes the
// popup — the cause of the hover "shake". We pick the roomier side and cap the height so it always fits.
function computeTooltipPlacement(
    map: IMapFacade,
    coordinates: LngLatLike,
    maxWidth: number,
): ITooltipPlacement {
    const { x, y } = map.project(coordinates);
    const { clientWidth, clientHeight } = map.getCanvas();

    // Anchor to the roomier side and cap the height to the room within the map. Containing the popup
    // is load-bearing: overflow → page scrollbar → map offset → restarts the hover "shake". MapLibre
    // anchors are inverted: "top" renders the popup below the point.
    const roomBelow = clientHeight - y - EDGE_MARGIN;
    const roomAbove = y - EDGE_MARGIN;
    const vertical = roomBelow >= roomAbove ? "top" : "bottom";
    const maxHeight = Math.max(roomBelow, roomAbove, MIN_CONTENT_HEIGHT);

    // Anchor to the near horizontal edge when a centered popup wouldn't fit, so it extends inward
    // and stays over the map (off the side panels).
    const half = maxWidth / 2;
    let horizontal: "" | "-left" | "-right" = "";
    if (x < half + EDGE_MARGIN) {
        horizontal = "-left";
    } else if (x > clientWidth - half - EDGE_MARGIN) {
        horizontal = "-right";
    }

    return { anchor: `${vertical}${horizontal}`, maxHeight };
}

/**
 * Shows the reused tooltip popup with a fixed anchor and a height capped to the available space.
 *
 * @internal
 */
export function presentTooltip(
    tooltip: IPopupFacade,
    map: IMapFacade,
    coordinates: LngLatLike,
    html: string,
    maxWidth: number,
): void {
    const { anchor, maxHeight } = computeTooltipPlacement(map, coordinates, maxWidth);

    tooltip.setAnchor(anchor).setLngLat(coordinates).setHTML(html).setMaxWidth(`${maxWidth}px`).addTo(map);

    const card = tooltip.getElement()?.querySelector<HTMLElement>(".gd-viz-tooltip-content");
    if (!card) {
        return;
    }

    // overflow + max-height live in tooltip.scss; we only feed the dynamic cap (unset → no clamp).
    card.style.setProperty("--gd-viz-tooltip-max-height", `${maxHeight}px`);

    // The popup has pointer-events:none, so overflow can't scroll; the clipped edge is faded in tooltip.scss.
    const markClipped = () => {
        card.classList.toggle(CLIPPED_CLASS, card.scrollHeight > card.clientHeight + 1);
    };
    markClipped();
    // Re-check once async images settle (load or error): either way the content height stabilizes.
    card.querySelectorAll("img").forEach((img) => {
        if (!img.complete) {
            img.addEventListener("load", markClipped, { once: true });
            img.addEventListener("error", markClipped, { once: true });
        }
    });
}
