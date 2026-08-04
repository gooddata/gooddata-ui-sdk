// (C) 2022-2026 GoodData Corporation

import { type ILayoutItemPath, type RenderMode } from "../../types.js";

import { useDashboardCustomizationsContext } from "./DashboardCustomizationsContext.js";

type LayoutElementType = "root" | "nested" | "section" | "item" | "leaf-item";

export const DEFAULT_SLIDE_WIDTH = 1920;
export const DEFAULT_SLIDE_HEIGHT = 1080;

export function useSlideData(renderMode: RenderMode | undefined) {
    const { slideConfig } = useDashboardCustomizationsContext();

    if (renderMode !== "export") {
        return undefined;
    }

    return {
        slideWidth: slideConfig?.width ?? DEFAULT_SLIDE_WIDTH,
        slideHeight: slideConfig?.height ?? DEFAULT_SLIDE_HEIGHT,
    };
}

export function useSlideSizeStyle(
    renderMode: RenderMode | undefined,
    type: LayoutElementType,
    parentLayoutPath?: ILayoutItemPath,
    hasHeaderRow = false,
) {
    const data = useSlideData(renderMode);

    if (!data) {
        return {};
    }

    if (type === "root") {
        return {
            width: `${data.slideWidth}px`,
        };
    }

    if (type === "section") {
        return {
            // Widgets in export mode have no min-height, their height comes solely from the
            // `height: 100%` chain below the grid item, so the row tracks must have a definite size.
            // Tracks sized from content (`auto`, `max-content`) collapse to the widget title only,
            // because visualizations are absolutely positioned and contribute no intrinsic height.
            //
            // The section header, when rendered, is the first grid item and must take just the space
            // it needs; the remaining rows split what is left. `minmax(0, 1fr)` (rather than plain
            // `1fr`) keeps tall content from pushing the rows over the slide height.
            ...(hasHeaderRow ? { gridTemplateRows: "max-content" } : {}),
            gridAutoRows: "minmax(0, 1fr)",
            ...(parentLayoutPath && parentLayoutPath.length > 0
                ? { height: "100%" }
                : { height: `${data.slideHeight}px`, overflow: "hidden" }),
        };
    }

    return {
        height: "100%",
    };
}
