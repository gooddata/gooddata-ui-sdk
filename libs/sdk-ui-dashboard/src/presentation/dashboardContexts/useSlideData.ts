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
        return parentLayoutPath && parentLayoutPath.length > 0
            ? {
                  gridTemplateRows: "max-content",
                  height: "100%",
              }
            : {
                  height: `${data.slideHeight}px`,
                  overflow: "hidden",
              };
    }

    return {
        height: "100%",
    };
}
