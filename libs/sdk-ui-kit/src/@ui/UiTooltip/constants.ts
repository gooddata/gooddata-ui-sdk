// (C) 2025 GoodData Corporation

import { Placement } from "@floating-ui/react";

export const ARROW_HEIGHT = 6;
export const ARROW_WIDTH = 12;
export const DEFAULT_BORDER_RADIUS = 3;
export const ADDITIONAL_ARROW_EDGE_OFFSET = 2;

export const SHOW_DELAY = 425;
export const HIDE_DELAY = 200;

export const oppositeSides: Partial<Record<Placement, Placement>> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
};
